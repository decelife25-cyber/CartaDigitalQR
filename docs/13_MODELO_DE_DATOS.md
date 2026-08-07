# 13 - MODELO DE DATOS

## Objetivo
Definir las entidades oficiales de CartaDigitalQR. Toda la aplicación deberá construirse utilizando exclusivamente este esquema en Supabase PostgreSQL.

## Tablas Principales

### Familias (Categorías)
Agrupa los productos de la carta (ej. Entrantes, Carnes, Postres).
- `id` (UUID, PK)
- `nombre` (Texto)
- `orden` (Entero)
- `visible` (Booleano)

### Productos (Platos)
- `id` (UUID, PK)
- `familia_id` (UUID, FK -> familias.id)
- `nombre` (Texto)
- `descripcion` (Texto)
- `precio` (Decimal)
- `imagen_url` (Texto)
- `disponible` (Booleano)
- `destacado` (Booleano)
- `orden` (Entero)

### Alérgenos
Catálogo oficial europeo. Relación muchos a muchos con Productos.
- `id` (UUID, PK)
- `nombre` (Texto)
- `icono_url` (Texto)

### Producto_Alergeno (Tabla Intermedia)
- `producto_id` (UUID, FK)
- `alergeno_id` (UUID, FK)

### Configuración
Almacena la configuración general del restaurante.
- `id` (UUID, PK)
- `nombre_restaurante` (Texto)
- `logotipo_url` (Texto)
- `color_principal` (Texto)
- `color_secundario` (Texto)
- `telefono` (Texto)
- `direccion` (Texto)
- `moneda` (Texto)
- `idioma` (Texto)
- `horario` (Texto)

## Relaciones
`Familias -> Productos -> Alérgenos`
