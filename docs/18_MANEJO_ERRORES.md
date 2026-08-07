# 18 - MANEJO DE ERRORES Y BACKUP

## Objetivo
Establecer estrategias para capturar errores y respaldar datos.

## Manejo de Errores
- **Red/Supabase**: Si una consulta falla (ej. timeout), capturar la excepción y mostrar un mensaje claro al usuario ("Error al conectar con la base de datos").
- **Errores de UI**: En la PWA usar Error Boundaries. En Android, usar estados de error en los ViewModels y mostrar Snackbars.
- **Validación**: Validar datos localmente antes de enviarlos a Supabase (ej. precio > 0, nombre no vacío).

## Backup y Recuperación
- Toda la base de datos se aloja en Supabase.
- Se confía en los backups automáticos del proyecto de Supabase (Point in Time Recovery si el tier lo permite).
- No hay exportaciones manuales ni bases de datos locales críticas. Si un dispositivo se rompe, el usuario puede usar otro e iniciar sesión con la misma URL de Supabase.
