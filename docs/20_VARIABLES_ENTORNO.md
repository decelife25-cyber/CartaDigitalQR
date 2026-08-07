# 20 - VARIABLES DE ENTORNO

## Objetivo
Documentar las variables necesarias para el proyecto.

## PWA (Pública)
Ubicadas en un archivo `.env` o inyectadas en el despliegue.
- `VITE_SUPABASE_URL`: La URL del proyecto Supabase.
- `VITE_SUPABASE_ANON_KEY`: La clave pública para leer datos.

## App Privada (Android)
- En tiempo de desarrollo, pueden estar en `local.properties`.
- En producción, el usuario final ingresa estas variables (`SUPABASE_URL`, `SUPABASE_ANON_KEY`) directamente en la pantalla de "Configuración -> Conexión" de la aplicación.
