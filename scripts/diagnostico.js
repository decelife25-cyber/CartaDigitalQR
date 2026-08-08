import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function runDiagnostic() {
  console.log('Iniciando diagnóstico de Supabase...');
  const supabaseUrl = process.env.VITE_SUPABASE_URL;
  const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) {
    console.error('Error: Las variables de entorno VITE_SUPABASE_URL y VITE_SUPABASE_ANON_KEY son requeridas.');
    process.exit(1);
  }

  const tables = [
    'configuracion',
    'familias',
    'productos',
    'alergenos',
    'producto_alergeno'
  ];

  let markdown = `# Diagnóstico Supabase\n\n`;
  markdown += `Fecha de ejecución: ${new Date().toISOString()}\n\n`;

  for (const table of tables) {
    console.log(`Diagnosticando tabla: ${table}...`);
    markdown += `## Tabla: \`${table}\`\n\n`;

    try {
      const endpoint = `${supabaseUrl}/rest/v1/${table}?select=*`;
      const response = await fetch(endpoint, {
        method: 'GET',
        headers: {
          apikey: supabaseKey,
          Authorization: `Bearer ${supabaseKey}`,
          'Content-Type': 'application/json',
          Prefer: 'return=representation'
        }
      });

      markdown += `- **HTTP status:** ${response.status} ${response.statusText}\n`;
      markdown += `- **¿La consulta pública funciona?:** ${response.ok ? 'Sí' : 'No'}\n`;

      if (response.ok) {
        markdown += `- **¿Existe la tabla?:** Sí\n`;
        const data = await response.json();
        markdown += `- **Número de registros accesibles:** ${data.length}\n`;

        if (data.length > 0) {
          const columns = Object.keys(data[0]);
          markdown += `- **Columnas reales devueltas:** \`${columns.join(', ')}\`\n`;
        } else {
          markdown += `- **Columnas reales devueltas:** No se pueden determinar (0 registros).\n`;
        }

        if (table === 'familias') {
          const visibleTrue = data.filter(item => item.visible === true).length;
          const visibleFalse = data.filter(item => item.visible === false).length;

          markdown += `- **Total de registros accesibles:** ${data.length}\n`;
          markdown += `- **Registros con visible=true:** ${visibleTrue}\n`;
          markdown += `- **Registros con visible=false:** ${visibleFalse}\n\n`;

          let classification;
          if (data.length === 0) {
            classification = 'A) tabla vacía (no se puede distinguir por esta consulta entre tabla realmente vacía y filas no visibles por RLS)';
          } else if (visibleTrue === 0) {
            classification = 'B) existen familias pero ninguna tiene visible=true';
          } else {
            classification = 'D) Supabase devuelve familias correctamente';
          }
          markdown += `### Clasificación: ${classification}\n\n`;

          markdown += `### Datos reales accesibles (${table})\n\n`;
          markdown += '```json\n';
          markdown += JSON.stringify(data, null, 2);
          markdown += '\n```\n';
        } else if (table === 'productos') {
          const disponibleTrue = data.filter(item => item.disponible === true).length;
          const disponibleFalse = data.filter(item => item.disponible === false).length;

          markdown += `- **Total de registros accesibles:** ${data.length}\n`;
          markdown += `- **Registros con disponible=true:** ${disponibleTrue}\n`;
          markdown += `- **Registros con disponible=false:** ${disponibleFalse}\n\n`;

          let classification;
          if (data.length === 0) {
            classification = 'A) tabla vacía (no se puede distinguir por esta consulta entre tabla realmente vacía y filas no visibles por RLS)';
          } else if (disponibleTrue === 0) {
            classification = 'B) existen productos pero ninguno tiene disponible=true';
          } else {
            classification = 'D) Supabase devuelve productos correctamente';
          }
          markdown += `### Clasificación: ${classification}\n\n`;

          markdown += `### Datos reales accesibles (${table})\n\n`;
          markdown += '```json\n';
          markdown += JSON.stringify(data, null, 2);
          markdown += '\n```\n';
        }
      } else {
        const errorText = await response.text();
        markdown += `- **Error exacto si falla:** \`${errorText}\`\n\n`;

        let errorCode = '';
        let errorMsg = '';
        try {
          const parsedError = JSON.parse(errorText);
          errorCode = parsedError.code || '';
          errorMsg = parsedError.message || '';
        } catch (ignore) {
          // El cuerpo no era JSON; se conserva el error textual para el diagnóstico.
        }

        const normalizedMessage = `${errorCode} ${errorMsg} ${errorText}`.toLowerCase();

        let existe = 'No se puede determinar';
        if (
          errorCode === '42P01' ||
          errorCode === 'PGRST205' ||
          /relation .* does not exist/i.test(errorMsg) ||
          /could not find the table/i.test(errorMsg)
        ) {
          existe = 'No';
        } else if (response.status === 401 || response.status === 403) {
          existe = 'No se puede determinar por esta respuesta de permisos/autenticación';
        }

        markdown += `- **¿Existe la tabla?:** ${existe}\n`;

        let classification;
        if (response.status === 401) {
          classification = 'E) error de autenticación';
        } else if (
          response.status === 403 &&
          /(row[- ]level security|rls|permission denied|policy)/i.test(normalizedMessage)
        ) {
          classification = 'C) RLS bloquea la consulta';
        } else if (response.status === 403) {
          classification = `E) error 403 no identificado como RLS: ${errorMsg || 'Forbidden sin más detalles'}`;
        } else if (
          errorCode === '42P01' ||
          errorCode === 'PGRST205' ||
          /relation .* does not exist/i.test(errorMsg) ||
          /could not find the table/i.test(errorMsg)
        ) {
          classification = 'E) tabla inexistente / error de esquema';
        } else {
          classification = `E) otro error de esquema/relación: ${errorMsg || `HTTP ${response.status}`}`;
        }

        if (table === 'familias' || table === 'productos') {
          markdown += `### Clasificación: ${classification}\n\n`;
        }
      }
    } catch (error) {
      markdown += `- **¿La consulta pública funciona?:** No\n`;
      markdown += `- **¿Existe la tabla?:** No se puede determinar\n`;
      markdown += `- **Error exacto si falla:** \`${error.message}\`\n`;
      if (table === 'familias' || table === 'productos') {
        markdown += `### Clasificación: E) error de ejecución: ${error.message}\n\n`;
      }
    }

    markdown += '\n---\n\n';
  }

  const docsDir = path.join(__dirname, '..', 'docs');
  if (!fs.existsSync(docsDir)) {
    fs.mkdirSync(docsDir, { recursive: true });
  }

  const outPath = path.join(docsDir, 'DIAGNOSTICO_SUPABASE.md');
  fs.writeFileSync(outPath, markdown, 'utf8');
  console.log('Diagnóstico completado. Resultados guardados en docs/DIAGNOSTICO_SUPABASE.md');
}

runDiagnostic();
