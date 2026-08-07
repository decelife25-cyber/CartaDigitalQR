# PANTALLA 012 · GESTIÓN DE SUGERENCIAS

# Objetivo

Esta pantalla permite definir qué productos se sugerirán al cliente cuando consulte un plato.

Las sugerencias sirven para aumentar las ventas mediante recomendaciones naturales.

No son publicidad.

No son promociones.

Son recomendaciones relacionadas con el producto.

---

# Imagen oficial de referencia

docs/REFERENCIAS/PRIVADO/12_Sugerencias.png

Esta imagen constituye la especificación oficial.

Debe reproducirse prácticamente igual.

No reinterpretar.

No rediseñar.

No modernizar.

---

# Filosofía

Las sugerencias deben ser muy fáciles de mantener.

El encargado debe poder modificarlas en pocos segundos.

Nunca debe ser necesario escribir manualmente el nombre de un producto.

---

# Fuente de datos

Toda la información procede exclusivamente de Supabase.

Nunca utilizar:

- mockData
- datos de ejemplo
- JSON locales
- arrays temporales

---

# Funcionamiento

Cada producto podrá tener:

Ninguna sugerencia.

Una sugerencia.

Varias sugerencias.

Las sugerencias siempre serán otros productos existentes en la base de datos.

Nunca texto libre.

---

# Información mostrada

Cada fila mostrará:

- Producto principal.
- Productos sugeridos.
- Número total de sugerencias.

Todo debe verse claramente.

---

# Añadir sugerencia

Debe existir un botón:

"Añadir sugerencia"

Al pulsarlo:

Seleccionar un producto existente.

Nunca escribir texto manualmente.

---

# Eliminar sugerencia

Cada sugerencia podrá eliminarse individualmente.

Solicitar confirmación únicamente cuando sea necesario.

---

# Búsqueda

Debe existir un buscador instantáneo.

Mientras el usuario escribe:

Filtrar automáticamente los productos.

Sin botón Buscar.

---

# Orden

Las sugerencias deben respetar el orden definido por el usuario.

Ese orden será el mostrado posteriormente en la carta pública.

---

# Navegación

Desde un producto debe poder abrirse directamente su editor.

No perder la posición del scroll.

---

# Responsive

Diseñado exclusivamente para teléfonos móviles.

Botones grandes.

Muy cómodo para trabajar durante todo el servicio.

---

# Rendimiento

Carga inmediata.

Actualizar únicamente el registro modificado.

No recargar toda la pantalla.

---

# Prohibiciones

No permitir escribir nombres manualmente.

No utilizar tablas de escritorio.

No utilizar formularios complejos.

No reinterpretar el diseño.

La imagen oficial define completamente esta pantalla.

---

# Criterios de aceptación

La pantalla solo se considerará terminada cuando:

- Sea prácticamente idéntica a la referencia.
- Todas las sugerencias procedan de Supabase.
- Permita gestionar recomendaciones de forma rápida y sencilla.