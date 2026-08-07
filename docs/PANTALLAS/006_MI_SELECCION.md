# PANTALLA 006 · MI SELECCIÓN

# Objetivo

Esta pantalla permite al cliente crear una lista de los platos que desea pedir.

NO es un carrito de compra.

NO realiza pedidos.

NO envía información al restaurante.

Su única finalidad es que el cliente pueda enseñar la selección al camarero cuando esté preparado para pedir.

---

# Imagen oficial de referencia

docs/REFERENCIAS/PUBLICO/6_Mi_seleccion.png

Esta imagen constituye la referencia oficial.

Debe reproducirse visualmente con la máxima fidelidad posible.

No reinterpretar.

No modernizar.

No cambiar la distribución.

---

# Fuente de datos

Toda la información procede exclusivamente de Supabase y del estado local de la selección del usuario.

Nunca utilizar datos de ejemplo.

Nunca utilizar datos mock.

---

# Contenido

Cada plato seleccionado mostrará:

- Fotografía.
- Nombre.
- Precio unitario.
- Cantidad.
- Precio total del artículo.

---

# Cantidad

Cada artículo dispondrá de:

Botón (-)

Cantidad actual.

Botón (+)

Al pulsar:

(-)

Reduce una unidad.

Si llega a cero:

el plato desaparece automáticamente de la selección.

(+)

Añade una unidad más.

La actualización debe ser inmediata.

---

# Precio

Cada línea mostrará:

Precio unitario.

Cantidad.

Importe total del artículo.

En la parte inferior aparecerá:

Total de la selección.

---

# Vaciar selección

Debe existir un botón:

"Vaciar selección"

Solicitar confirmación antes de eliminar todos los platos.

---

# Mostrar al camarero

Debe existir un botón destacado:

"Mostrar al camarero"

Este botón únicamente prepara la lista para ser mostrada.

No envía pedidos.

No realiza pagos.

No conecta con cocina.

---

# Navegación

Debe existir un botón para volver a la carta.

No perder la selección mientras dure la sesión.

---

# Responsive

Optimizado exclusivamente para teléfonos móviles.

Botones grandes.

Separación suficiente para evitar pulsaciones accidentales.

---

# Rendimiento

Las modificaciones deben ser instantáneas.

No recargar la pantalla completa.

Actualizar únicamente el elemento modificado.

---

# Filosofía

La aplicación NO sustituye al camarero.

Simplemente ayuda al cliente a recordar los platos que desea pedir.

Toda la interacción final sigue realizándose con el personal del restaurante.

---

# Prohibiciones

No implementar pedidos online.

No implementar pagos.

No implementar pasarela de pago.

No enviar pedidos automáticamente.

No solicitar registro.

No solicitar inicio de sesión.

No modificar el diseño oficial.

La imagen de referencia define completamente la interfaz que debe implementarse.