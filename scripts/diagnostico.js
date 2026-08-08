async function runDiagnostic() {
  console.log("Iniciando diagnóstico de Supabase...");
  const supabaseUrl = process.env.VITE_SUPABASE_URL;
  const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) {
    console.error("Error: Las variables de entorno VITE_SUPABASE_URL y VITE_SUPABASE_ANON_KEY son requeridas.");
    process.exit(1);
  }

  try {
    const endpoint = `${supabaseUrl}/rest/v1/categories?select=*`;
    console.log("Realizando petición a:", endpoint.replace(supabaseUrl, '[URL_REDACTED]'));

    const response = await fetch(endpoint, {
      method: 'GET',
      headers: {
        'apikey': supabaseKey,
        'Authorization': `Bearer ${supabaseKey}`,
        'Content-Type': 'application/json',
        'Prefer': 'return=representation'
      }
    });

    console.log("Status code:", response.status);
    console.log("Status text:", response.statusText);

    const headers = {};
    response.headers.forEach((value, key) => {
      headers[key] = value;
    });
    console.log("Response headers:", JSON.stringify(headers, null, 2));

    const text = await response.text();
    console.log("Raw response body (truncated to 500 chars):", text.substring(0, 500));

    if (response.ok) {
      console.log("Diagnóstico exitoso. Se pudo conectar con la API REST.");
    } else {
      console.log("Error en el diagnóstico REST API.");
    }

    // Test categories
    console.log("\nProbando tabla de products...");
    const productsEndpoint = `${supabaseUrl}/rest/v1/products?select=*`;
    const productsResponse = await fetch(productsEndpoint, {
      method: 'GET',
      headers: {
        'apikey': supabaseKey,
        'Authorization': `Bearer ${supabaseKey}`,
        'Content-Type': 'application/json',
        'Prefer': 'return=representation'
      }
    });
    console.log("Status code (products):", productsResponse.status);
    const productsText = await productsResponse.text();
    console.log("Raw response body (products, truncated):", productsText.substring(0, 500));

  } catch (error) {
    console.error("Error al ejecutar el diagnóstico:", error.message);
  }
}

runDiagnostic();
