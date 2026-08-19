import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

function read(relativePath) {
  return fs.readFileSync(path.join(root, relativePath), 'utf8');
}

function exists(relativePath) {
  assert.ok(fs.existsSync(path.join(root, relativePath)), `Falta ${relativePath}`);
}

for (const file of [
  'index.html',
  'public/manifest.json',
  'public/sw.js',
  'public/icon-192.svg',
  'public/icon-512.svg',
  'src/lib/supabase.ts',
  'src/services/api.ts',
  'src/services/adminApi.ts',
  'src/types/database.ts',
]) {
  exists(file);
}

const manifest = JSON.parse(read('public/manifest.json'));
assert.equal(manifest.display, 'standalone', 'La PWA debe usar display=standalone');
assert.ok(Array.isArray(manifest.icons) && manifest.icons.length >= 2, 'Faltan iconos PWA');
assert.ok(manifest.icons.some((icon) => icon.src.includes('icon-192')), 'Falta icono 192');
assert.ok(manifest.icons.some((icon) => icon.src.includes('icon-512')), 'Falta icono 512');

const serviceWorker = read('public/sw.js');
assert.ok(serviceWorker.includes("const CACHE_NAME = 'carta-digital-static-v3'"), 'Service Worker desactualizado');
assert.ok(serviceWorker.includes("url.hostname.endsWith('.supabase.co')"), 'El Service Worker debe excluir Supabase de la caché');
assert.ok(!serviceWorker.includes("caches.open('api-cache')"), 'No debe existir caché persistente de la API');
assert.ok(!serviceWorker.includes('cache.put(event.request, response.clone())'), 'No debe almacenarse la respuesta de Supabase en caché');

const app = read('src/App.tsx');
assert.ok(app.includes('path="/admin/login"'), 'No se encuentra la ruta de login');
assert.ok(app.includes('path="/admin"'), 'No se encuentra la ruta raíz del panel privado');
for (const route of ['path="familias"', 'path="productos"', 'path="configuracion"']) {
  assert.ok(app.includes(route), `No se encuentra la ruta privada ${route}`);
}

const databaseTypes = read('src/types/database.ts');
assert.ok(databaseTypes.includes('configuracion_restaurante_id'), 'Falta la relación con el restaurante');
assert.ok(databaseTypes.includes('sugerido: boolean'), 'Falta el campo sugerido de producto');

console.log('Smoke tests CartaDigitalQR: OK');
