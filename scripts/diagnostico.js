import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

async function run() {
  const url = process.env.VITE_SUPABASE_URL;
  const anonKey = process.env.VITE_SUPABASE_ANON_KEY;

  if (!url || !anonKey) {
    console.error('Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY');
    process.exit(1);
  }

  const supabase = createClient(url, anonKey);
  const tables = ['configuracion', 'familias', 'productos', 'alergenos', 'producto_alergeno'];

  // Only show the base URL to avoid leaking possible tokens in query string (though not expected)
  const safeUrl = new URL(url).origin;

  let markdown = `# Diagnóstico real de Supabase

## Conexión
- URL del proyecto: ${safeUrl}
- Cliente Supabase inicializado: SÍ
- Consulta real ejecutada: SÍ

## Tablas
`;

  for (const table of tables) {
    markdown += `\n### ${table}\n\n`;

    const { data, error, status } = await supabase.from(table).select('*');

    markdown += `- HTTP status: ${status}\n`;

    if (error) {
      markdown += `- Existe: DESCONOCIDO\n`;
      markdown += `- Consulta pública: ERROR\n`;
      markdown += `- Error exacto: [${error.code}] ${error.message} (Detalles: ${error.details || 'N/A'})\n`;
      markdown += `- Clasificación: C) RLS bloquea la consulta O E) existe otro error de esquema/relación\n`;
    } else {
      markdown += `- Existe: SÍ\n`;
      markdown += `- Consulta pública: OK\n`;
      markdown += `- Número total de registros accesibles: ${data.length}\n`;

      let classification = "D) Supabase devuelve datos correctamente";

      if (data.length > 0) {
        const columns = Object.keys(data[0]);
        markdown += `- Columnas detectadas (reales): ${columns.join(', ')}\n`;

        if (table === 'familias') {
          const visibleCount = data.filter(r => r.visible === true).length;
          markdown += `- Número de registros con visible=true: ${visibleCount}\n`;
          if (visibleCount === 0) classification = "B) existen familias pero ninguna tiene visible=true";
        } else if (table === 'productos') {
          const dispCount = data.filter(r => r.disponible === true).length;
          markdown += `- Número de registros con disponible=true: ${dispCount}\n`;
          if (dispCount === 0) classification = "B) existen productos pero ninguno tiene disponible=true";
        }

        markdown += `- Clasificación final: ${classification}\n\n`;

        if (table === 'familias' || table === 'productos') {
          markdown += `#### Datos Reales (${table})\n\`\`\`json\n`;
          markdown += JSON.stringify(data, null, 2);
          markdown += `\n\`\`\`\n`;
        }
      } else {
        classification = "A) La tabla está vacía o RLS oculta todos los registros.";
        markdown += `- Columnas detectadas: (La tabla está vacía, no se pueden inferir las columnas)\n`;
        if (table === 'familias') {
           markdown += `- Número de registros con visible=true: 0\n`;
        } else if (table === 'productos') {
           markdown += `- Número de registros con disponible=true: 0\n`;
        }
        markdown += `- Clasificación final: ${classification}\n`;
      }
    }
  }

  const docsPath = path.resolve(process.cwd(), 'docs');
  if (!fs.existsSync(docsPath)) {
    fs.mkdirSync(docsPath, { recursive: true });
  }

  fs.writeFileSync(path.resolve(docsPath, 'DIAGNOSTICO_SUPABASE.md'), markdown, 'utf-8');
  console.log('Diagnóstico generado en docs/DIAGNOSTICO_SUPABASE.md');
}

run().catch(err => {
  console.error(err);
  process.exit(1);
});
