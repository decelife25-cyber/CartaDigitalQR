# PANTALLA 004 · FICHA DEL PLATO

# Objetivo

Mostrar toda la información de un plato de forma clara, atractiva y muy fácil de leer desde un teléfono móvil.

Esta pantalla debe ser la principal herramienta para que el cliente decida pedir el plato.

---

# Imagen oficial de referencia

docs/REFERENCIAS/PUBLICO/4_Ficha_plato.png

Esta imagen es la referencia visual OFICIAL.

Debe reproducirse prácticamente igual.

No reinterpretar.

No modernizar.

No cambiar el diseño.

---

# Fuente de datos

Toda la información procede exclusivamente de Supabase.

Nunca utilizar datos de ejemplo.

Nunca utilizar datos mock.

Nunca hardcodear información.

---

# Información que debe mostrarse

Fotografía del plato.

Nombre.

Descripción completa.

Precio.

Alérgenos.

Sugerencias.

Botón para añadir a la selección.

---

# Fotografía

Es el elemento principal de la pantalla.

Debe ocupar gran parte del ancho.

Mantener la proporción.

No deformar.

Si el plato no tiene fotografía:

mostrar una imagen placeholder.

---

# Nombre

Debe mostrarse muy destacado.

Es el texto más importante de la pantalla.

---

# Precio

Visible desde el primer momento.

Grande.

Muy legible.

---

# Descripción

Mostrar el texto completo.

Sin cortar.

Con buena separación entre líneas.

---

# Alérgenos

Mostrar únicamente los alérgenos existentes para ese plato.

Cada alérgeno se representa mediante su icono oficial.

No mostrar iconos vacíos.

---

# Sugerencias

Si el plato tiene sugerencias asociadas en Supabase:

mostrarlas debajo de la descripción.

Si no existen:

no mostrar el bloque.

---

# Botón "Añadir a mi selección"

Debe permanecer siempre visible.

Grande.

Fácil de pulsar.

Al pulsarlo:

añadir el producto a la selección del cliente.

No debe abrir ventanas adicionales.

---

# Navegación

Debe existir un botón para volver al listado anterior.

No perder la posición del scroll.

---

# Responsive

Diseñada exclusivamente para móviles.

No priorizar escritorio.

---

# Rendimiento

Carga inmediata.

Las imágenes deben optimizarse.

No realizar consultas innecesarias.

---

# Prohibiciones

No inventar información.

No añadir botones adicionales.

No añadir animaciones innecesarias.

No modificar el diseño de referencia.

La fotografía oficial es la especificación visual que debe seguir exactamente la implementación.