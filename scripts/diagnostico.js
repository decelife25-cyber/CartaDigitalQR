const fs = require('fs');
const path = require('path');

const TABLES = [
  'configuracion',
  'familias',
  'productos',
  'alergenos',
  'producto_alergeno'
];

function redact(text, supabaseUrl) {
  if (!text) return '';
  return String(text).replaceAll(supabaseUrl, '[SUPABASE_URL_REDACTED]');
}

function inferType(value) {
  if (value === null) return 'null';
  if (Array.isArray(value)) return 'array';
  return typeof value;
}

function columnTypes(rows) {
  const result = {};
  for (const row of rows) {
    for (const [key, value] of Object.entries(row)) {
      if (!result[key]) result[key] = new Set();
      result[key].add(inferType(value));
    }
  }
  return Object.fromEntries(
    Object.entries(result).map(([key, types]) => [key, [...types].join(' | ')])
  );
}

function classify(table, status, data, errorMessage) {
  if (table !== 'familias' && table !== 'productos') return '';

  if (status === 200) {
    if (data.length === 0) return 'A) tabla vacía (0 registros accesibles públicamente)';

    if (table === 'familias') {
      const visible = data.filter(row => row.visible === true).length;
      return visible === 0
        ? 'B) existen familias pero ninguna tiene visible=true'
        : 'D) Supabase devuelve familias correctamente';
    }

    const disponible = data.filter(row => row.disponible === true).length;
    return disponible === 0
      ? 'B) existen productos pero ninguno tiene disponible=true'
      : 'D) Supabase devuelve productos correctamente';
  }

  const message = (errorMessage || '').toLowerCase();
  const looksLikeRls =
    status === 401 ||
    status === 403 ||
    message.includes('row-level security') ||
    message.includes('permission denied') ||
    message.includes('rls');

  return looksLikeRls
    ? 'C) la consulta pública está bloqueada por permisos/RLS'
    : 'E) existe otro error de esquema/relación o de acceso';
}

async function queryTable(table, supabaseUrl, supabaseKey) {
  const endpoint = `${supabaseUrl.replace(/\/$/, '')}/rest/v1/${table}?select=*`;
  const response = await fetch(endpoint, {
    method: 'GET',
    headers: {
      apikey: supabaseKey,
      Authorization: `Bearer ${supabaseKey}`,
      Accept: 'application/json'
    }
  });

  const text = await response.text();
  let data = null;
  let parsedError = null;

  try {
    data = JSON.parse(text);
  } catch {
    parsedError = text || response.statusText;
  }

  if (response.ok && Array.isArray(data)) {
    return {
      table,
      status: response.status,
      exists: true,
      ok: true,
      data,
      error: null
    };
  }

  const errorMessage =
    data && typeof data === 'object'
      ? data.message || data.error_description || data.hint || JSON.stringify(data)
      : parsedError || response.statusText;

  return {
    table,
    status: response.status,
    exists: response.status !== 404,
    ok: false,
    data: [],
    error: redact(errorMessage, supabaseUrl)
  };
}

function appendTableReport(markdown, result) {
  const { table, status, exists, ok, data, error } = result;
  markdown += `## ${table}\n\n`;
  markdown += `- **Existe:** ${exists ? 'SÍ' : 'NO'}\n`;
  markdown += `- **Consulta pública:** ${ok ? 'OK' : 'ERROR'}\n`;
  markdown += `- **HTTP status:** ${status}\n`;

  if (!ok) {
    markdown += `- **Error exacto devuelto por Supabase:** ${error || 'Sin mensaje'}\n`;
    if (table === 'familias' || table === 'productos') {
      markdown += `- **Clasificación:** ${classify(table, status, data, error)}\n`;
    }
    markdown += '\n---\n\n';
    return markdown;
  }

  const columns = data.length ? Object.keys(data[0]) : [];
  const types = columnTypes(data);

  markdown += `- **Registros accesibles:** ${data.length}\n`;
  markdown += `- **Columnas reales devueltas:** ${columns.length ? columns.map(c => `\`${c}\``).join(', ') : 'No determinables porque la respuesta contiene 0 registros'}\n`;

  if (columns.length) {
    markdown += '- **Tipos inferidos a partir de los valores JSON devueltos:**\n';
    for (const column of columns) markdown += `  - \`${column}\`: ${types[column]}\n`;
  }

  if (table === 'familias') {
    const visibleTrue = data.filter(row => row.visible === true).length;
    const visibleFalse = data.filter(row => row.visible === false).length;
    markdown += `- **Registros con visible=true:** ${visibleTrue}\n`;
    markdown += `- **Registros con visible=false:** ${visibleFalse}\n`;
    markdown += `- **Clasificación:** ${classify(table, status, data, '')}\n`;
  }

  if (table === 'productos') {
    const disponibleTrue = data.filter(row => row.disponible === true).length;
    const disponibleFalse = data.filter(row => row.disponible === false).length;
    markdown += `- **Registros con disponible=true:** ${disponibleTrue}\n`;
    markdown += `- **Registros con disponible=false:** ${disponibleFalse}\n`;
    markdown += `- **Clasificación:** ${classify(table, status, data, '')}\n`;
  }

  if (table === 'familias' || table === 'productos') {
    markdown += `\n### Datos reales accesibles\n\n`;
    markdown += '```json\n';
    markdown += JSON.stringify(data, null, 2);
    markdown += '\n```\n';
  }

  markdown += '\n---\n\n';
  return markdown;
}

async function runDiagnostic() {
  const supabaseUrl = process.env.VITE_SUPABASE_URL;
  const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) {
    console.error('ERROR: faltan VITE_SUPABASE_URL o VITE_SUPABASE_ANON_KEY.');
    process.exit(1);
  }

  let publicOrigin;
  try {
    publicOrigin = new URL(supabaseUrl).origin;
  } catch {
    console.error('ERROR: VITE_SUPABASE_URL no es una URL válida.');
    process.exit(1);
  }

  console.log('Iniciando diagnóstico REAL de Supabase.');
  console.log(`Proyecto Supabase: ${publicOrigin}`);
  console.log('Cliente: inicializado con las variables de entorno del workflow.');

  let markdown = '# Diagnóstico real de Supabase\n\n';
  markdown += `Fecha de ejecución: ${new Date().toISOString()}\n\n`;
  markdown += '## Conexión\n\n';
  markdown += `- **URL pública del proyecto:** ${publicOrigin}\n`;
  markdown += '- **Cliente Supabase inicializado:** SÍ\n';
  markdown += '- **Consulta real ejecutada:** SÍ\n';
  markdown += '- **Credenciales incluidas en este informe:** NO\n\n';
  markdown += '## Tablas del modelo de datos\n\n';
  markdown += `Se consultan exactamente las tablas definidas en \`docs/13_MODELO_DE_DATOS.md\`: ${TABLES.map(t => `\`${t}\``).join(', ')}.\n\n`;

  for (const table of TABLES) {
    console.log(`Consultando ${table}...`);
    try {
      const result = await queryTable(table, supabaseUrl, supabaseKey);
      markdown = appendTableReport(markdown, result);
    } catch (error) {
      const message = redact(error.message || String(error), supabaseUrl);
      markdown += `## ${table}\n\n`;
      markdown += '- **Existe:** No determinable\n';
      markdown += '- **Consulta pública:** ERROR\n';
      markdown += `- **Error exacto:** ${message}\n`;
      if (table === 'familias' || table === 'productos') {
        markdown += '- **Clasificación:** E) error de conexión/esquema no HTTP\n';
      }
      markdown += '\n---\n\n';
    }
  }

  markdown += '## Seguridad\n\n';
  markdown += '- No se incluyen claves, tokens, cookies, service_role ni credenciales.\n';
  markdown += '- Las consultas se realizan exclusivamente con `VITE_SUPABASE_URL` y `VITE_SUPABASE_ANON_KEY` proporcionados por GitHub Actions.\n';
  markdown += '- No se utiliza `service_role`.\n';
  markdown += '- No se modifica RLS ni se realiza ningún bypass.\n';

  const docsDir = path.join(__dirname, '..', 'docs');
  fs.mkdirSync(docsDir, { recursive: true });
  const outPath = path.join(docsDir, 'DIAGNOSTICO_SUPABASE.md');
  fs.writeFileSync(outPath, markdown, 'utf8');

  console.log('Diagnóstico completado. Informe generado en docs/DIAGNOSTICO_SUPABASE.md.');
}

runDiagnostic().catch(error => {
  console.error(`ERROR inesperado: ${error.message}`);
  process.exit(1);
});
