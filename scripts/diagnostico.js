const fs = require('fs');
const path = require('path');

async function runDiagnostic() {
  console.log("Iniciando diagnóstico de Supabase...");
  const supabaseUrl = process.env.VITE_SUPABASE_URL;
  const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) {
    console.error("Error: Las variables de entorno VITE_SUPABASE_URL y VITE_SUPABASE_ANON_KEY son requeridas.");
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
          'apikey': supabaseKey,
          'Authorization': `Bearer ${supabaseKey}`,
          'Content-Type': 'application/json',
          'Prefer': 'return=representation'
        }
      });

      markdown += `- **Estado HTTP:** ${response.status} ${response.statusText}\n`;

      if (response.ok) {
        const data = await response.json();
        markdown += `- **Resultado:** Éxito. La consulta pública funciona.\n`;
        markdown += `- **Número de registros accesibles:** ${data.length}\n`;

        if (data.length > 0) {
          const columns = Object.keys(data[0]);
          markdown += `- **Columnas reales devueltas:** \`${columns.join(', ')}\`\n`;

          if (table === 'familias' || table === 'productos') {
            markdown += `\n### Datos reales accesibles (${table})\n\n`;
            markdown += '```json\n';
            markdown += JSON.stringify(data, null, 2);
            markdown += '\n```\n';
          }
        } else {
          markdown += `- **Columnas reales devueltas:** No se pueden determinar (0 registros).\n`;
        }
      } else {
        const errorText = await response.text();
        markdown += `- **Resultado:** Error.\n`;
        markdown += `- **Error exacto:** \`${errorText}\`\n`;
      }
    } catch (error) {
      markdown += `- **Resultado:** Error en la petición.\n`;
      markdown += `- **Error exacto:** \`${error.message}\`\n`;
    }

    markdown += `\n---\n\n`;
  }

  const docsDir = path.join(__dirname, '..', 'docs');
  if (!fs.existsSync(docsDir)) {
    fs.mkdirSync(docsDir, { recursive: true });
  }

  const outPath = path.join(docsDir, 'DIAGNOSTICO_SUPABASE.md');
  fs.writeFileSync(outPath, markdown, 'utf8');
  console.log(`Diagnóstico completado. Resultados guardados en docs/DIAGNOSTICO_SUPABASE.md`);
}

runDiagnostic();
