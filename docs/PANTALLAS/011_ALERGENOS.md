# PANTALLA 011 · GESTIÓN DE ALÉRGENOS

# Objetivo

Esta pantalla permite administrar el catálogo oficial de alérgenos y asociarlos rápidamente a los productos.

Debe ser extremadamente sencilla.

La rapidez es mucho más importante que la estética.

---

# Imagen oficial de referencia

docs/REFERENCIAS/PRIVADO/11_Alergenos.png

Esta imagen constituye la especificación oficial.

Debe reproducirse prácticamente igual.

No reinterpretar.

No rediseñar.

No modernizar.

---

# Filosofía

Los alérgenos son un elemento obligatorio de la carta.

Su gestión debe ser rápida, clara y sin posibilidad de errores.

---

# Fuente de datos

Toda la información procede exclusivamente de Supabase.

Nunca utilizar:

- mockData
- datos de ejemplo
- arrays locales
- JSON temporales

---

# Información mostrada

Cada alérgeno mostrará:

- Icono oficial.
- Nombre.
- Descripción (opcional).
- Estado.

Todo debe verse de un vistazo.

---

# Iconos

Cada alérgeno tiene un icono único.

Nunca utilizar iconos distintos para el mismo alérgeno.

Los iconos deben mantenerse uniformes en toda la aplicación.

---

# Orden

Los alérgenos aparecerán siempre en el mismo orden.

Ese orden será el utilizado también en la carta pública.

---

# Edición

Debe permitirse modificar:

- Nombre.
- Icono.
- Estado.
- Descripción.

Los cambios deben guardarse inmediatamente en Supabase.

---

# Asociación con productos

Desde esta pantalla debe poder consultarse:

Cuántos productos utilizan cada alérgeno.

En futuras versiones podrá mostrarse el listado completo.

---

# Eliminación

Antes de eliminar un alérgeno:

Comprobar si está siendo utilizado.

Si existen productos asociados:

Advertir claramente al usuario.

Nunca eliminar sin confirmación.

---

# Navegación

Volver siempre a la pantalla anterior manteniendo la posición.

---

# Responsive

Diseñado exclusivamente para teléfonos móviles.

Botones grandes.

Texto perfectamente legible.

---

# Rendimiento

Carga inmediata.

Actualizar únicamente el elemento modificado.

No recargar toda la pantalla.

---

# Prohibiciones

No utilizar tablas de escritorio.

No utilizar ventanas innecesarias.

No reinterpretar el diseño.

La imagen oficial define completamente la interfaz.

---

# Criterios de aceptación

La pantalla solo se considerará terminada cuando:

- Sea prácticamente idéntica a la referencia.
- Todos los datos procedan de Supabase.
- Permita gestionar todos los alérgenos de forma rápida y segura.