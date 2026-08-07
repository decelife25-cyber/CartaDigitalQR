# 16 - COMPORTAMIENTO OFFLINE

## Objetivo
Definir cómo actúa la aplicación sin conexión a internet.

## PWA (Aplicación Pública)
- Utiliza Service Workers para almacenar en caché:
  - Estructura de la aplicación (HTML, CSS, JS).
  - Imágenes principales y logotipos.
- Los datos dinámicos provienen de Supabase. Si no hay conexión, se muestra un mensaje de "Sin conexión a internet" o se muestran los últimos datos cacheados si están disponibles en local (opcional/mejora futura).

## App Privada
- Debe almacenar temporalmente (caché en memoria o base de datos local SQLite/Room) los datos de productos y familias para navegación rápida.
- Sin embargo, las operaciones de escritura (CRUD) deben requerir conexión a internet para confirmar con Supabase (Single Source of Truth).
- Se mostrará un indicador de "Estado de Sincronización" o "Sin Red" en la cabecera si el dispositivo pierde conexión.
