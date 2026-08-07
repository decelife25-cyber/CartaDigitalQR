# 014 - MULTIRESTAURANTE

## Objetivo

La aplicación debe poder utilizarse en cualquier restaurante sin modificar el código fuente.

Toda la personalización debe realizarse desde el panel privado.

---

# Configuración inicial

La instalación incluirá por defecto la configuración oficial de CartaDigitalQR para facilitar el primer arranque.

La aplicación debe funcionar inmediatamente después de instalarse.

---

# Pantalla de configuración

Debe existir una pantalla denominada:

Configuración → Conexión

Con los siguientes campos:

- URL de Supabase
- Clave pública (Anon Key)
- Nombre del restaurante
- Logotipo
- Color principal
- Color secundario
- Moneda
- Idioma

---

# Cambio de restaurante

Al modificar la URL y la clave de Supabase, toda la aplicación debe comenzar a utilizar automáticamente la nueva base de datos.

No debe ser necesario:

- modificar código
- recompilar
- volver a desplegar
- cambiar archivos manualmente

---

# Personalización

Cada restaurante podrá personalizar:

- Nombre
- Logotipo
- Colores
- Información de contacto
- Redes sociales
- Horarios
- Política de privacidad
- Política de cookies

---

# Fuente de datos

Toda la información de la aplicación procederá exclusivamente de la instancia de Supabase configurada.

Queda prohibido utilizar datos locales como fuente principal.

---

# Escalabilidad

La arquitectura debe permitir instalar la misma aplicación en cientos o miles de restaurantes diferentes utilizando únicamente una configuración distinta.

---

# Criterios de aceptación

La funcionalidad se considerará terminada únicamente si:

- Es posible cambiar completamente de restaurante sin modificar el código.
- La aplicación continúa funcionando correctamente.
- Toda la información procede de la nueva base de datos.
- El logotipo y los datos del restaurante cambian automáticamente.
- No existen valores codificados (hardcoded) dependientes de un restaurante concreto.