# BASE DE DATOS

## Objetivo de la base de datos
Centralizar y gestionar toda la información de la CartaDigitalQR para un restaurante específico, proporcionando acceso inmediato y persistencia de datos tanto para la carta pública como para el panel privado. La base de datos es la única fuente de la verdad para todo el sistema.

## Arquitectura
El sistema utiliza una arquitectura de base de datos relacional sobre PostgreSQL mediante **Supabase**. Cada restaurante utiliza su propia instancia o proyecto de Supabase, de forma que el acceso a los datos está segmentado mediante la URL y la Anon Key de Supabase.

## Todas las tablas
Basado en la estructura del proyecto, las tablas existentes son:
1. `familias`
2. `productos`
3. `alergenos`
4. `producto_alergenos` (Tabla de relación)
5. `configuracion`

---

## Detalle de Tablas y Campos

### 1. Tabla: `familias`
**Objetivo:** Almacenar las categorías de la carta.

#### Todos los campos y Tipo de cada campo:
- `id` (UUID)
- `nombre` (TEXT)
- `imagen` (TEXT) - URL de la imagen
- `orden` (INTEGER)
- `estado` (TEXT) - 'Visible' u 'Oculta'
- `created_at` (TIMESTAMP WITH TIME ZONE)
- `updated_at` (TIMESTAMP WITH TIME ZONE)

#### Propiedades:
- **Claves primarias:** `id`
- **Campos obligatorios:** `nombre`, `orden`, `estado`
- **Valores por defecto:** `id` = gen_random_uuid(), `estado` = 'Visible', `created_at` = now()
- **Restricciones:** El nombre no puede estar vacío.

### 2. Tabla: `productos`
**Objetivo:** Almacenar la información de los platos y productos de la carta.

#### Todos los campos y Tipo de cada campo:
- `id` (UUID)
- `nombre` (TEXT)
- `descripcion` (TEXT)
- `precio` (NUMERIC)
- `familia_id` (UUID)
- `imagen` (TEXT) - URL de la imagen
- `estado` (TEXT) - 'Visible' u 'Oculto'
- `disponibilidad` (BOOLEAN) - true/false (disponible o agotado)
- `sugerido` (BOOLEAN) - true/false; marca temporal de producto sugerido
- `created_at` (TIMESTAMP WITH TIME ZONE)
- `updated_at` (TIMESTAMP WITH TIME ZONE)

#### Propiedades:
- **Claves primarias:** `id`
- **Claves externas:** `familia_id` -> `familias.id`
- **Campos obligatorios:** `nombre`, `precio`, `familia_id`, `estado`
- **Valores por defecto:** `id` = gen_random_uuid(), `disponibilidad` = true, `estado` = 'Visible', `sugerido` = false
- **Restricciones:** `precio` >= 0

### 3. Tabla: `alergenos`
**Objetivo:** Catálogo de alérgenos disponibles.

#### Todos los campos y Tipo de cada campo:
- `id` (UUID)
- `nombre` (TEXT)
- `icono` (TEXT) - URL del icono o identificador
- `created_at` (TIMESTAMP WITH TIME ZONE)

#### Propiedades:
- **Claves primarias:** `id`
- **Campos obligatorios:** `nombre`, `icono`
- **Valores por defecto:** `id` = gen_random_uuid()

### 4. Tabla: `producto_alergenos`
**Objetivo:** Asociar múltiples alérgenos a cada producto.

#### Todos los campos y Tipo de cada campo:
- `producto_id` (UUID)
- `alergeno_id` (UUID)

#### Propiedades:
- **Claves primarias:** (`producto_id`, `alergeno_id`)
- **Claves externas:**
  - `producto_id` -> `productos.id`
  - `alergeno_id` -> `alergenos.id`
- **Campos obligatorios:** `producto_id`, `alergeno_id`

### 5. Tabla: `configuracion`
**Objetivo:** Almacenar la configuración general y opciones de personalización del restaurante (único registro).

#### Todos los campos y Tipo de cada campo:
- `id` (UUID)
- `nombre_restaurante` (TEXT)
- `logotipo` (TEXT)
- `imagen_principal` (TEXT)
- `telefono` (TEXT)
- `direccion` (TEXT)
- `horario` (TEXT)
- `redes_sociales` (JSONB)
- `pagina_web` (TEXT)
- `texto_bienvenida` (TEXT)
- `orden_familias` (JSONB) - Opcional si se usa orden en la tabla familias
- `mostrar_productos_agotados` (BOOLEAN)
- `imagen_generica_productos` (TEXT)
- `imagen_generica_familias` (TEXT)
- `calidad_fotografias` (TEXT)
- `compresion_automatica` (BOOLEAN)
- `tema_claro` (BOOLEAN)
- `tema_oscuro` (BOOLEAN)
- `moneda` (TEXT)
- `idioma` (TEXT)
- `color_principal` (TEXT)
- `color_secundario` (TEXT)

#### Propiedades:
- **Claves primarias:** `id`
- **Campos obligatorios:** `nombre_restaurante`
- **Valores por defecto:** `id` = gen_random_uuid(), `mostrar_productos_agotados` = true

---

## Relaciones
- `familias` tiene muchos `productos` (1:N).
- `productos` tiene muchos `alergenos` a través de `producto_alergenos` (N:M).

## Índices
- Índice en `productos.familia_id` para búsquedas rápidas por categoría.
- Índice en `productos.nombre` (texto) para acelerar el buscador de platos.
- Índice en `familias.orden` para ordenar rápidamente las categorías.
- Índice parcial en `productos.sugerido` para localizar rápidamente los productos marcados como sugerencia.

## Reglas de borrado (ON DELETE)
- Si se borra un producto, se borran en cascada sus registros en `producto_alergenos`.
- Si se borra un alérgeno, se borran en cascada los registros de `producto_alergenos`.
- No se permite borrar una familia si tiene productos (RESTRICT), o debe solicitar confirmación en el panel (se asume RESTRICT a nivel base de datos para prevenir inconsistencias).

## Reglas de actualización (ON UPDATE)
- Cascada en todas las relaciones mediante las Claves Primarias UUID (CASCADE), aunque al ser UUID es raro que se actualicen.

## RLS (Row Level Security)
- **Carta Pública:** Las tablas de solo lectura (`familias`, `productos`, `alergenos`, configuración) tienen políticas de lectura (`SELECT`) permitidas de forma anónima (con Anon Key) cuando el estado es 'Visible'.
- **Panel Privado:** Todas las operaciones de escritura (`INSERT`, `UPDATE`, `DELETE`) y lectura completa requieren autenticación del administrador o personal del restaurante (Authenticated Role en Supabase).

## Flujo de lectura
1. La aplicación realiza las consultas a Supabase utilizando la librería oficial (`@supabase/supabase-js`).
2. Se consultan primero las configuraciones y familias ordenadas.
3. Al navegar, se filtran los productos por `familia_id`.
4. El buscador de platos realiza consultas con filtro `ilike` sobre el nombre del producto o ingredientes.
5. Los componentes siempre consultan la información fresca si hay cambios (o usan caché optimista).

## Flujo de escritura
1. Sólo disponible desde el panel privado de administración.
2. Todas las modificaciones se hacen mediante peticiones autenticadas.
3. Se actualiza únicamente el campo o registro modificado, minimizando la recarga de datos (optimización móvil).
4. El guardado es manual, mediante el botón "Guardar" y los cambios se persisten inmediatamente en Supabase.

## Buenas prácticas
- No usar consultas pesadas que traigan todo si no es necesario (usar limitación y selección específica de columnas para listados).
- Aprovechar las funciones `JSONB` para campos sin una estructura estricta como las redes sociales.
- Mantener siempre actualizado `updated_at` a través de un trigger de base de datos.
- Nunca almacenar información sensible sin cifrar o exponer endpoints sin RLS.
- Nunca utilizar datos `mock`; si una tabla está vacía, mostrar estado vacío.

## Criterios de aceptación
- La documentación abarca completamente la estructura actual de Supabase y las funcionalidades requeridas.
- Todos los apartados listados están presentes y detallados en español.
- No se han inventado tablas que no estén respaldadas por la documentación y capturas previas.
- El documento es coherente y respeta la filosofía de ser la única fuente de verdad y servir para multi-restaurante.