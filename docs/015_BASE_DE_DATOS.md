# BASE DE DATOS — CARTADIGITALQR

## Fuente única de verdad

CartaDigitalQR utiliza **Supabase PostgreSQL** como backend único de datos.

La aplicación pública y el panel privado utilizan Supabase mediante `@supabase/supabase-js`.

Este documento describe el modelo que utiliza actualmente el código. Para cambios estructurales, la referencia ejecutable son las migraciones SQL de `supabase/migrations/`.

## Entidades actuales

### `configuracion_restaurante`

Configuración del restaurante utilizada por el panel y por la carta pública.

Campos utilizados actualmente:

- `id`
- `nombre`
- `logo_url`
- `color_principal`
- `descripcion`
- `direccion`
- `telefono`
- `redes_sociales`
- `horario`
- `qr_url`
- `dominio`
- `url_reservas_mesa`
- `activo`

### `familias`

Categorías de la carta.

Campos utilizados actualmente:

- `id`
- `configuracion_restaurante_id`
- `nombre`
- `descripcion`
- `foto_url`
- `activo`
- `orden`
- `created_at`
- `updated_at`

### `productos`

Artículos de la carta.

Campos utilizados actualmente:

- `id`
- `configuracion_restaurante_id`
- `familia_id`
- `nombre`
- `descripcion`
- `precio`
- `foto_url`
- `activo`
- `agotado`
- `destacado`
- `sugerido`
- `orden`
- `created_at`
- `updated_at`

### `alergenos`

Catálogo de alérgenos.

Campos utilizados actualmente:

- `id`
- `nombre`
- `sigla`
- `icono`
- `descripcion`
- `orden`

### `producto_alergeno`

Tabla de relación muchos-a-muchos entre productos y alérgenos.

Campos:

- `producto_id`
- `alergeno_id`

## Relaciones

```text
configuracion_restaurante
   │
   ├── familias
   │      │
   │      └── productos
   │              │
   │              └── producto_alergeno ── alergenos
```

## Seguridad

La API de Supabase está protegida mediante Row Level Security (RLS).

### Público

El rol `anon` debe poder consultar únicamente los datos que la carta pública necesita y que estén permitidos por las políticas RLS.

### Privado

El panel privado requiere una sesión Supabase autenticada.

Las operaciones de escritura se realizan con el rol `authenticated` y están sujetas a las políticas RLS vigentes.

Las políticas exactas no deben duplicarse manualmente en esta documentación: la fuente ejecutable es `supabase/migrations/`.

## Migraciones actuales

El repositorio mantiene migraciones para:

- permisos/RLS de la carta;
- permisos de `configuracion_restaurante`;
- campo `sugerido` de productos;
- URL de reservas de mesa.

Todas las modificaciones de esquema deben quedar registradas como migración SQL.

## Imágenes

Las imágenes administradas desde el panel se almacenan mediante Supabase Storage. Los servicios del frontend comprimen imágenes grandes antes de subirlas cuando corresponde.

## Reglas de desarrollo

1. No introducir Google Sheets, Apps Script ni otro backend paralelo.
2. No utilizar datos mock para sustituir la base real.
3. No inventar tablas o nombres de columnas que no existan en el esquema actual.
4. Mantener `src/types/database.ts` sincronizado con el modelo utilizado.
5. Toda modificación de esquema debe tener su migración SQL.
6. Las operaciones privadas deben comprobar sesión antes de modificar datos.
7. Las políticas RLS deben considerarse parte de la aplicación, no una configuración opcional.

## Nota de arquitectura multi-restaurante

`configuracion_restaurante_id` ya forma parte de familias y productos. Sin embargo, las políticas actuales para `authenticated` deben endurecerse si el producto pasa a operar con múltiples restaurantes y usuarios independientes, para impedir que un usuario autenticado pueda modificar datos de otro restaurante.
