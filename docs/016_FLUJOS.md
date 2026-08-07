# FLUJOS DE NAVEGACIÓN

## Cliente (Carta Pública)

### 1. Escaneo QR
- **Pantalla origen:** Cámara del móvil del cliente (externa).
- **Acción del usuario:** Escanear el código QR ubicado en la mesa o el restaurante.
- **Pantalla destino:** Pantalla principal (Portada).
- **Datos utilizados:** URL proporcionada por el QR con identificadores del restaurante.
- **Consultas a Supabase:** Se carga la `configuracion` del restaurante para personalizar los estilos, colores, logo y textos iniciales.
- **Posibles errores:** URL inválida, QR ilegible o base de datos de Supabase no disponible.
- **Comportamiento esperado:** La app carga rápidamente la pantalla de portada personalizada sin pedir login y descarga los datos mínimos necesarios.

### 2. Pantalla principal (Portada)
- **Pantalla origen:** Escaneo QR.
- **Acción del usuario:** Pulsar el botón para ver la carta o pulsar el icono de menú.
- **Pantalla destino:** Familias / Carta.
- **Datos utilizados:** Logo, imagen principal y nombre del restaurante.
- **Consultas a Supabase:** No realiza nuevas consultas si los datos se trajeron al inicio. Se validan las tablas `configuracion`.
- **Posibles errores:** Error al cargar la imagen principal o logo.
- **Comportamiento esperado:** Transición fluida a la lista de categorías.

### 3. Familias
- **Pantalla origen:** Pantalla principal.
- **Acción del usuario:** Ver listado o pulsar sobre una familia en concreto.
- **Pantalla destino:** Listado de platos.
- **Datos utilizados:** Lista de familias, ordenadas por el campo `orden`, y con `estado = 'Visible'`.
- **Consultas a Supabase:** `SELECT * FROM familias WHERE estado = 'Visible' ORDER BY orden`.
- **Posibles errores:** La consulta devuelve cero familias.
- **Comportamiento esperado:** Muestra en forma de listado compacto todas las familias disponibles. Si no hay imagen, muestra imagen genérica.

### 4. Listado
- **Pantalla origen:** Familias.
- **Acción del usuario:** Hacer scroll para ver los platos o pulsar sobre un plato.
- **Pantalla destino:** Ficha producto.
- **Datos utilizados:** Lista de productos filtrados por el `familia_id` seleccionado y que sean visibles.
- **Consultas a Supabase:** `SELECT * FROM productos WHERE familia_id = [ID] AND estado = 'Visible'`.
- **Posibles errores:** No hay productos en la categoría o error de conexión.
- **Comportamiento esperado:** Muestra un listado muy visual con foto reducida, nombre, precio y disponibilidad. Scroll vertical muy rápido y eficiente.

### 5. Ficha producto
- **Pantalla origen:** Listado / Buscar.
- **Acción del usuario:** Añadir producto a su selección, volver al listado, o ver sugerencias.
- **Pantalla destino:** Mi selección, o de vuelta al Listado.
- **Datos utilizados:** Todos los campos del producto (nombre, descripción larga, foto grande, precio), y relaciones como `alergenos` y `sugerencias`.
- **Consultas a Supabase:** `SELECT * FROM productos WHERE id = [ID]`, `SELECT * FROM alergenos INNER JOIN producto_alergenos...`, `SELECT * FROM productos INNER JOIN producto_sugerencias...`.
- **Posibles errores:** Producto ya no disponible (se agotó entre que abrió y quiso pedir).
- **Comportamiento esperado:** Toda la información clave del plato. El botón de "Añadir a mi selección" es prominente y visible, actualiza el estado local inmediatamente.

### 6. Buscar
- **Pantalla origen:** Botón de lupa (accesible desde navegación global).
- **Acción del usuario:** Escribir en el campo de texto ("Buscar plato...").
- **Pantalla destino:** La misma pantalla de búsqueda mostrando resultados dinámicos. Al pulsar un resultado -> Ficha producto.
- **Datos utilizados:** Término introducido por el usuario.
- **Consultas a Supabase:** `SELECT * FROM productos WHERE estado = 'Visible' AND (nombre ILIKE '%[termino]%' OR descripcion ILIKE '%[termino]%')`.
- **Posibles errores:** Sin resultados.
- **Comportamiento esperado:** Se muestran los resultados en vivo sin necesidad de pulsar un botón de enviar. Si no hay resultados se indica con un mensaje claro.

### 7. Mi selección
- **Pantalla origen:** Menú inferior o ficha de producto.
- **Acción del usuario:** Modificar cantidades, borrar productos, o vaciar selección. Prepararse para enseñar al camarero.
- **Pantalla destino:** Botón "Mostrar al camarero" simplemente adapta la vista, o puede volver a la Carta.
- **Datos utilizados:** Estado local del carrito del usuario (NO requiere guardar este estado en Supabase, sólo consulta los precios actualizados).
- **Consultas a Supabase:** Puede hacer revalidación silenciosa de precios.
- **Posibles errores:** Los datos en caché local difieren de Supabase.
- **Comportamiento esperado:** Actualización instantánea en la interfaz local. NO realiza pedidos online ni pagos.

### 8. Alérgenos (vista cliente)
- **Pantalla origen:** Iconos dentro de la Ficha producto.
- **Acción del usuario:** Tocar sobre un alérgeno (si aplica ver detalle).
- **Pantalla destino:** N/A o tooltip de información.
- **Datos utilizados:** Iconos y nombres de alérgenos.
- **Consultas a Supabase:** Consultas de la relación `producto_alergenos`.
- **Posibles errores:** Iconos que no cargan.
- **Comportamiento esperado:** Se identifican visualmente los alérgenos usando el icono oficial del sistema.

### 9. Sugerencias
- **Pantalla origen:** Inferior de la Ficha producto.
- **Acción del usuario:** Pulsar un plato sugerido.
- **Pantalla destino:** Nueva Ficha producto (del sugerido).
- **Datos utilizados:** Productos relacionados a través de la tabla `producto_sugerencias`.
- **Consultas a Supabase:** `SELECT * FROM productos WHERE id IN (sugerencias_ids)`.
- **Posibles errores:** La sugerencia dejó de estar visible y aparece rota.
- **Comportamiento esperado:** Navegación similar al listado que abre una ficha.

---

## Administrador (Panel Privado)

### 1. Login
- **Pantalla origen:** Acceso a URL privada.
- **Acción del usuario:** Introducir credenciales.
- **Pantalla destino:** Home.
- **Datos utilizados:** Correo y contraseña (o método soportado por Supabase Auth).
- **Consultas a Supabase:** Petición de Autenticación a Supabase Auth.
- **Posibles errores:** Credenciales inválidas.
- **Comportamiento esperado:** Iniciar sesión y asignar el token JWT al usuario para poder operar con RLS autorizado.

### 2. Home
- **Pantalla origen:** Login.
- **Acción del usuario:** Elegir la sección a gestionar.
- **Pantalla destino:** Familias, Productos, Alérgenos, o Configuración.
- **Datos utilizados:** Resumen general, estado sincronización, datos restaurante.
- **Consultas a Supabase:** Lectura del restaurante (tabla `configuracion`).
- **Posibles errores:** Token caducado.
- **Comportamiento esperado:** Carga muy rápida de un panel con botones grandes.

### 3. Familias
- **Pantalla origen:** Home.
- **Acción del usuario:** Ver, crear, editar, eliminar, o reordenar categorías.
- **Pantalla destino:** Editor de Familia (pantalla o misma vista expandida).
- **Datos utilizados:** Listado de todas las familias, incluyendo las ocultas.
- **Consultas a Supabase:** `SELECT * FROM familias ORDER BY orden`. Mutaciones: `INSERT/UPDATE/DELETE familias`.
- **Posibles errores:** Intento de eliminar una familia que tiene productos asociados.
- **Comportamiento esperado:** Vista compacta y modificación rápida; si hay error al borrar se alerta al usuario.

### 4. Productos
- **Pantalla origen:** Home.
- **Acción del usuario:** Buscar productos (instantáneo), filtrar por estado/familia, tocar para editar, o crear nuevo.
- **Pantalla destino:** Editor de Producto.
- **Datos utilizados:** Toda la tabla `productos` con posibilidad de traer un conteo o campos de relación rápidos.
- **Consultas a Supabase:** Listado global o paginado: `SELECT * FROM productos`.
- **Posibles errores:** Error de conexión durante listado largo.
- **Comportamiento esperado:** Permite gestionar cientos de productos fluidamente en móvil. Búsqueda muy rápida (en local o consulta `ilike` rápida a base de datos).

### 5. Editor (Editor de Producto)
- **Pantalla origen:** Listado de Productos.
- **Acción del usuario:** Rellenar campos, subir foto, cambiar estado, asociar alérgenos y sugerencias. Pulsar "Guardar".
- **Pantalla destino:** Regresa al Listado de Productos manteniendo el scroll.
- **Datos utilizados:** Detalle de 1 producto específico y catálogos de `familias` y `alergenos` para selectores.
- **Consultas a Supabase:** `UPDATE productos SET ...`, modificaciones cruzadas en `producto_alergenos`.
- **Posibles errores:** Guardado fallido (ej: precio negativo, falta familia).
- **Comportamiento esperado:** Operación manual. Carga al instante los datos previos, no actualiza la base de datos hasta pulsar "Guardar". Las operaciones deben ser cuasi inmediatas.

### 6. Alérgenos
- **Pantalla origen:** Home.
- **Acción del usuario:** Crear nuevo alérgeno, subir icono, modificar nombre.
- **Pantalla destino:** Misma pantalla de gestión de alérgenos.
- **Datos utilizados:** Tabla `alergenos`.
- **Consultas a Supabase:** Select / Insert / Delete en `alergenos`.
- **Posibles errores:** Error de subida de icono o alérgeno que no se borra al estar en uso.
- **Comportamiento esperado:** Se administran rápidamente, sin tabla de escritorio y totalmente responsive para Android.

### 7. Configuración
- **Pantalla origen:** Home.
- **Acción del usuario:** Modificar nombre restaurante, logotipo, colores, configuraciones globales. Pulsar "Guardar Configuración".
- **Pantalla destino:** Home.
- **Datos utilizados:** Único registro de la tabla `configuracion`.
- **Consultas a Supabase:** `UPDATE configuracion SET ...`.
- **Posibles errores:** Fallo en subida de logo principal.
- **Comportamiento esperado:** Todas las opciones en un mismo sitio. Modificaciones no se guardan hasta pulsar "Guardar". Confirmación tras el éxito de la petición.