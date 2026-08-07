# 15 - AUTENTICACIÓN

## Objetivo
Definir el flujo de autenticación para la aplicación.

## PWA (Aplicación Pública)
- No requiere autenticación.
- El usuario accede a la carta como anónimo de solo lectura.
- Supabase RLS debe permitir `SELECT` en tablas públicas.

## App Privada (Panel de Administración)
- Requiere autenticación obligatoria antes de mostrar el panel.
- Proveedor: Supabase Auth (Email/Contraseña).
- El estado de la sesión debe mantenerse localmente de manera segura (ej. EncryptedSharedPreferences o DataStore en Android).
- En el primer inicio, si no hay sesión, se muestra la pantalla de Login y/o Configuración de Conexión.
- Si el token expira, el usuario es redirigido automáticamente a la pantalla de Login.

## Roles
- `anon`: Lectura pública.
- `authenticated`: Lectura y escritura en la App Privada.
