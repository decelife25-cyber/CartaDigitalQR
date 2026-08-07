# 014 - MULTIRESTAURANTE Y CONFIGURACIÓN DINÁMICA

## Objetivo
La aplicación (tanto PWA como App Privada) debe poder utilizarse en cualquier restaurante **sin modificar el código fuente**. Toda la personalización debe realizarse desde el panel de administración privado y reflejarse automáticamente.

## Pantalla de Configuración (App Privada)
Debe existir una pantalla "Configuración -> Conexión" con los campos:
- URL de Supabase
- Clave pública (Anon Key)
- *(El resto de la configuración - nombre, logo, colores - se guarda en la tabla `Configuración` de la instancia conectada).*

## Cambio de Restaurante
Al modificar la URL y la clave de Supabase en la App Privada, toda la aplicación debe comenzar a utilizar automáticamente la nueva base de datos.
No debe ser necesario:
- Modificar código.
- Recompilar.
- Cambiar archivos manualmente.

## Personalización Dinámica
La PWA y la App Privada deben consultar la tabla `Configuración` al iniciar para cargar dinámicamente:
- Nombre del restaurante
- Logotipo
- Colores principales (inyectados en el tema/Tailwind)
- Moneda e Idioma

## Criterios de Aceptación
- Es posible cambiar completamente de restaurante cambiando credenciales.
- La aplicación sigue funcionando correctamente.
- Toda la información, diseño y configuración proviene de la nueva base de datos.
- No hay variables hardcodeadas dependientes de un restaurante concreto en el código fuente.
