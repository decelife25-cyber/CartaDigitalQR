# 03 - SUPABASE Y BACKEND

## Backend Compartido
Supabase se utiliza exclusivamente como base de datos, sistema de autenticación y almacenamiento para ambas aplicaciones. Es la **única** fuente de la verdad.

## Configuración de la Conexión a la Base de Datos
- Las variables esenciales son: `SUPABASE_URL` y `SUPABASE_ANON_KEY`.
- En la PWA, se inyectan como variables de entorno genéricas.
- En la App Privada, el usuario puede modificar la conexión desde el panel para apuntar a un proyecto Supabase distinto (Multirestaurante).

## Flujo de Autenticación
1. **PWA**: No requiere autenticación. Acceso anónimo/público de solo lectura.
2. **App Privada**:
   - Inicio de sesión mediante Correo y Contraseña a través de Supabase Auth.
   - El token se almacena localmente de forma segura.

## Variables de Entorno
- `VITE_SUPABASE_URL`: URL del proyecto de Supabase (PWA).
- `VITE_SUPABASE_ANON_KEY`: Clave anónima pública de Supabase (PWA).
*(En la App Privada, estas variables pueden venir configuradas por defecto y ser sobreescritas en tiempo de ejecución).*

## Reglas de Seguridad (RLS - Row Level Security)
- **Lectura Pública**: Las tablas (`productos`, `familias`, `configuracion`) permiten `SELECT` a usuarios anónimos (`anon`).
- **Escritura Privada**: Las operaciones `INSERT`, `UPDATE`, `DELETE` requieren que el usuario esté autenticado (`authenticated`).
- Todas las tablas deben tener RLS activado.

## Roles de Usuario
- **Anónimo (Cliente)**: Visualiza la carta pública.
- **Autenticado (Administrador)**: Tiene acceso total de edición a la carta desde la App Privada.

## Estrategia de Backup y Recuperación
- Supabase realiza backups automáticos (Point-in-Time Recovery si está configurado en el proyecto).
- No se implementan copias de seguridad locales.
- Si un dispositivo se pierde, se instala la app en otro y se inicia sesión conectándose a la misma URL de Supabase.
