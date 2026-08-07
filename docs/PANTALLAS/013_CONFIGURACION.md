# PANTALLA 013 · CONFIGURACIÓN

# Objetivo

Esta pantalla centraliza toda la configuración general de la aplicación.

Debe permitir modificar el funcionamiento del sistema sin necesidad de editar código.

Está destinada exclusivamente al propietario o administrador del restaurante.

No será utilizada durante el servicio normal.

---

# Imagen oficial de referencia

docs/REFERENCIAS/PRIVADO/13_Configuracion.png

Esta imagen constituye la especificación oficial.

Debe reproducirse prácticamente igual.

No reinterpretar.

No rediseñar.

No modernizar.

---

# Filosofía

Toda la configuración del restaurante debe encontrarse en una única pantalla.

Debe ser muy sencilla.

Muy clara.

Muy segura.

Nunca debe requerir conocimientos técnicos.

---

# Fuente de datos

Toda la información procede exclusivamente de Supabase.

Nunca utilizar:

- mockData
- datos de ejemplo
- archivos JSON
- configuraciones locales

Toda la configuración debe almacenarse en Supabase.

---

# Datos generales

Debe permitir modificar:

- Nombre del restaurante.
- Logotipo.
- Imagen principal.
- Teléfono.
- Dirección.
- Horario.
- Redes sociales.
- Página web.
- Texto de bienvenida.

---

# Configuración de la carta

Debe permitir configurar:

- Orden de familias.
- Productos visibles.
- Productos ocultos.
- Mostrar productos agotados.
- Imagen genérica.
- Tema claro.
- Tema oscuro.

---

# Configuración de fotografías

Debe permitir definir:

Imagen genérica de productos.

Imagen genérica de familias.

Calidad de fotografías.

Compresión automática.

---

# Configuración de IA

Reservar un apartado para futuras funciones basadas en IA.

No implementar todavía.

Solo preparar la estructura.

---

# Copias de seguridad

Reservar un apartado para:

Exportar.

Importar.

Restaurar.

No implementar todavía.

---

# Guardado

Toda modificación debe guardarse mediante un botón:

GUARDAR CONFIGURACIÓN

Nunca guardar automáticamente.

Mostrar confirmación al finalizar.

---

# Navegación

Volver siempre a la pantalla principal del panel privado.

---

# Responsive

Diseñado exclusivamente para teléfonos Android.

No optimizar primero para escritorio.

---

# Rendimiento

La carga debe ser inmediata.

Guardar únicamente los datos modificados.

No realizar consultas innecesarias.

---

# Seguridad

Todas las operaciones deberán estar protegidas mediante autenticación.

Nunca permitir acceso desde la parte pública.

---

# Prohibiciones

No añadir opciones que no hayan sido aprobadas.

No reinterpretar el diseño.

No utilizar paneles de administración genéricos.

No utilizar plantillas comerciales.

La imagen oficial define completamente esta pantalla.

---

# Criterios de aceptación

Esta pantalla solo se considerará terminada cuando:

- Sea prácticamente idéntica a la referencia oficial.
- Toda la configuración se almacene correctamente en Supabase.
- Permita modificar el comportamiento general de la aplicación de forma sencilla y segura.