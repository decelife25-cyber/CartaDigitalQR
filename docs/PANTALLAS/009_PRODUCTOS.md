# PANTALLA 009 · GESTIÓN DE PRODUCTOS

# Objetivo

Esta pantalla es el núcleo de toda la aplicación privada.

Desde aquí se gestionan todos los productos de la carta.

Debe permitir localizar, editar y crear productos en muy pocos segundos.

Toda la pantalla está diseñada para trabajar muchas horas al día desde un teléfono móvil.

La rapidez tiene prioridad absoluta.

---

# Imagen oficial de referencia

docs/REFERENCIAS/PRIVADO/9_Productos.png

Esta imagen constituye la especificación oficial.

No interpretar.

No rediseñar.

No modernizar.

Debe reproducirse prácticamente igual.

---

# Filosofía

El objetivo NO es crear un gestor bonito.

El objetivo es trabajar rápido.

Debe mostrarse la mayor cantidad posible de información sin perder claridad.

Debe minimizarse el número de pulsaciones necesarias.

---

# Fuente de datos

Toda la información procede exclusivamente de Supabase.

Nunca utilizar:

- mockData
- JSON locales
- arrays de ejemplo
- datos hardcodeados

Supabase es la única fuente de datos.

---

# Información mostrada por cada producto

Cada producto debe mostrar:

- Fotografía.
- Nombre.
- Familia.
- Precio.
- Estado (Visible / Oculto).
- Disponibilidad.
- Indicador de fotografía.
- Indicador de alérgenos.
- Indicador de sugerencias.

Todo ello debe verse de un vistazo.

---

# Fotografías

La fotografía NO es el elemento principal.

Debe ocupar un espacio reducido.

El protagonista siempre es la información.

Si un producto no tiene fotografía:

mostrar una imagen genérica.

Nunca dejar espacios vacíos.

---

# Nombre

Debe ser el texto más destacado.

Debe poder localizarse rápidamente mientras se hace scroll.

---

# Precio

Debe verse inmediatamente.

Grande.

Muy legible.

Siempre alineado.

---

# Familia

Debe mostrarse claramente.

Debe ser posible identificar rápidamente a qué familia pertenece el producto.

---

# Estado

Cada producto mostrará claramente si está:

Visible.

Oculto.

Agotado (si esta función se implementa).

El estado debe poder cambiarse rápidamente.

---

# Acciones disponibles

Cada producto permitirá:

Editar.

Duplicar.

Ocultar.

Mostrar.

Eliminar.

Estas acciones deben poder ejecutarse con el mínimo número de pulsaciones.

---

# Nuevo producto

Debe existir un botón claramente visible:

"NUEVO PRODUCTO"

Siempre accesible.

---

# Búsqueda

Debe existir un buscador instantáneo.

Mientras el usuario escribe:

la lista se actualiza automáticamente.

Sin botón Buscar.

---

# Filtros

Debe poder filtrarse por:

Familia.

Estado.

Disponibilidad.

Estos filtros deben ser muy rápidos.

---

# Scroll

Debe ser extremadamente fluido.

No debe perder la posición al volver desde el editor.

---

# Responsive

Optimizado exclusivamente para teléfonos móviles Android.

No priorizar escritorio.

---

# Rendimiento

La pantalla debe cargar muy rápidamente.

No recargar toda la lista tras una modificación.

Actualizar únicamente el elemento modificado.

---

# Prohibiciones

No utilizar tablas de escritorio.

No utilizar grids complejos.

No utilizar dashboards genéricos.

No utilizar plantillas de administración.

No reinterpretar el diseño.

La imagen oficial define completamente la interfaz.

---

# Criterios de aceptación

Esta pantalla solo se considerará terminada cuando:

- Sea visualmente prácticamente idéntica a la imagen oficial.
- Todos los datos procedan de Supabase.
- Permita gestionar cientos de productos con rapidez.
- El scroll sea fluido.
- La búsqueda sea instantánea.
- La edición pueda iniciarse con una sola pulsación.