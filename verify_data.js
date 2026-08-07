import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error("Missing credentials in .env");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function verify() {
  console.log("Testing configuracion table...");
  const config = await supabase.from('configuracion').select('*').limit(1);
  console.log("Config Result:", config);

  console.log("\nTesting familias table...");
  const familias = await supabase.from('familias').select('*');
  console.log("Familias Result:", familias.data?.slice(0, 2) || familias);

  console.log("\nTesting productos table...");
  const productos = await supabase.from('productos').select('*').limit(2);
  console.log("Productos Result:", productos);
}

verify();