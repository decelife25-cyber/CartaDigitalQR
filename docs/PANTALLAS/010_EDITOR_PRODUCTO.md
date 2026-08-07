# PANTALLA 010 · EDITOR DE PRODUCTO

# Objetivo

Esta es la pantalla más importante de toda la aplicación privada.

Desde aquí se crea, modifica y elimina toda la información de un producto.

Debe ser extremadamente rápida.

Debe permitir editar un producto completo en menos de un minuto.

Toda la pantalla está diseñada para utilizarse desde un teléfono móvil durante el trabajo diario del restaurante.

---

# Imagen oficial de referencia

docs/REFERENCIAS/PRIVADO/10_EditorProducto.png

Esta imagen constituye la especificación oficial.

No interpretar.

No rediseñar.

No modernizar.

Debe reproducirse prácticamente igual.

---

# Filosofía

La rapidez tiene prioridad absoluta.

El usuario debe poder modificar cualquier dato sin navegar entre múltiples pantallas.

Todo debe estar organizado de forma lógica.

No utilizar formularios interminables.

---

# Fuente de datos

Toda la información procede exclusivamente de Supabase.

Nunca utilizar:

- mockData
- datos de ejemplo
- JSON locales
- arrays temporales

---

# Campos del producto

La pantalla debe permitir editar como mínimo:

• Nombre.

• Descripción corta.

• Descripción larga.

• Precio.

• Familia.

• Orden.

• Disponible.

• Visible.

• Fotografía.

• Alérgenos.

• Sugerencias.

• Ingredientes.

• Observaciones internas.

Todos estos datos deben guardarse directamente en Supabase.

---

# Fotografía

Debe existir una zona claramente identificada para la fotografía.

Si el producto tiene imagen:

mostrarla.

Si no existe:

mostrar un placeholder.

Debe existir un botón:

Cambiar fotografía.

En el futuro permitirá:

- cámara
- galería
- IA

---

# Familia

Debe seleccionarse mediante una lista sencilla.

Nunca escribiendo texto manualmente.

---

# Precio

Debe permitir únicamente valores válidos.

Mostrar siempre el formato monetario correcto.

---

# Descripciones

Los cuadros de texto deben crecer automáticamente cuando sea necesario.

No limitar artificialmente el espacio.

---

# Alérgenos

Los alérgenos NO se escribirán.

Se seleccionarán mediante iconos.

La selección debe ser muy rápida.

---

# Sugerencias

Debe existir un apartado específico para asociar sugerencias.

No escribir texto libre.

Siempre seleccionar productos existentes.

---

# Guardar

Debe existir un botón muy visible:

GUARDAR

Al pulsarlo:

Validar los datos.

Guardar en Supabase.

Mostrar confirmación.

Volver automáticamente si así se configura.

---

# Cancelar

Debe existir un botón:

Cancelar.

Nunca guardar cambios automáticamente.

---

# Eliminar

Debe existir un botón:

Eliminar producto.

Solicitar confirmación antes de borrar.

Nunca eliminar accidentalmente.

---

# Navegación

Volver exactamente al punto del listado desde el que se abrió.

No perder la posición del scroll.

---

# Responsive

Optimizado exclusivamente para teléfonos Android.

Todo debe poder utilizarse cómodamente con una sola mano.

---

# Rendimiento

Guardar únicamente los campos modificados.

No recargar información innecesaria.

Las operaciones deben ser prácticamente instantáneas.

---

# Prohibiciones

No utilizar formularios de escritorio.

No dividir la edición en múltiples asistentes.

No utilizar ventanas emergentes innecesarias.

No reinterpretar el diseño.

No crear campos no solicitados.

La imagen oficial define completamente esta pantalla.

---

# Criterios de aceptación

Esta pantalla solo se considerará terminada cuando:

- Sea prácticamente idéntica a la imagen oficial.
- Permita editar completamente un producto.
- Guarde correctamente en Supabase.
- Sea muy rápida de utilizar.
- Permita trabajar durante horas desde un teléfono móvil sin perder agilidad.