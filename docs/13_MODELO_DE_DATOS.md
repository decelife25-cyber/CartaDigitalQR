# 13 - MODELO DE DATOS

## Objetivo

Definir el modelo de datos que utiliza actualmente CartaDigitalQR. Este documento debe mantenerse sincronizado con `src/types/database.ts` y con las migraciones SQL de `supabase/migrations/`.

La fuente real de persistencia es **Supabase PostgreSQL**.

## Tablas y entidades actuales

### Configuracion del restaurante

La configuración operativa del restaurante se gestiona actualmente mediante `configuracion_restaurante`.

Campos utilizados por la aplicación:

- `id` — identificador UUID.
- `nombre` — nombre del restaurante.
- `logo_url` — URL del logotipo, opcional.
- `color_principal` — color principal, opcional.
- `descripcion` — descripción, opcional.
- `direccion` — dirección, opcional.
- `telefono` — teléfono, opcional.
- `redes_sociales` — objeto JSON con enlaces, opcional.
- `horario` — horario, opcional.
- `qr_url` — URL del QR, opcional.
- `dominio` — dominio propio, opcional.
- `url_reservas_mesa` — URL externa de reservas de mesa, opcional.
- `activo` — indica si la configuración está activa.

La aplicación actual consulta y modifica esta tabla desde el panel privado.

### Familias

Tabla lógica: `familias`.

Campos utilizados por la aplicación:

- `id`
- `configuracion_restaurante_id`
- `nombre`
- `descripcion`
- `foto_url`
- `activo`
- `orden`
- `created_at`
- `updated_at`

Una familia agrupa los productos de la carta.

### Productos

Tabla lógica: `productos`.

Campos utilizados por la aplicación:

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

`familia_id` relaciona cada producto con su familia.

### Alérgenos

Tabla lógica: `alergenos`.

Campos utilizados por la aplicación:

- `id`
- `nombre`
- `sigla`
- `icono`
- `descripcion`
- `orden`

Los iconos y nombres mostrados en la carta proceden de este catálogo.

### Relacion producto-alergeno

Tabla lógica: `producto_alergeno`.

Campos:

- `producto_id`
- `alergeno_id`

Permite una relación muchos-a-muchos entre productos y alérgenos.

## Relaciones

```text
configuracion_restaurante
        │
        ├── familias
        │      │
        │      └── productos
        │              │
        │              └── producto_alergeno ── alergenos
        │
        └── configuración pública
```

## Backend y seguridad

- Backend: Supabase PostgreSQL.
- Cliente frontend: `@supabase/supabase-js`.
- La carta pública utiliza el rol `anon` para lecturas permitidas.
- El panel privado requiere una sesión autenticada.
- Las políticas RLS son obligatorias para las tablas expuestas mediante la API.

Las políticas reales deben consultarse en `supabase/migrations/`. Este documento no sustituye esas políticas.

## Migraciones actuales

Las migraciones del repositorio son la referencia de cambios estructurales. Entre las existentes se encuentran:

- correcciones RLS de la carta;
- permisos de `configuracion_restaurante`;
- campo `sugerido` de productos;
- URL del programa externo de reservas de mesa.

No deben crearse tablas, campos o nombres alternativos en el código sin actualizar primero el modelo y su migración.

## Regla de coherencia

No utilizar en código nuevo los nombres antiguos que aparecen en documentación histórica, especialmente:

- `configuracion` cuando se esté hablando de la configuración actual del restaurante;
- `producto_alergenos` como nombre de la tabla actual.

Los nombres actualmente utilizados por el código son `configuracion_restaurante` y `producto_alergeno`.

Si la estructura real de Supabase cambia, deben actualizarse en la misma modificación:

1. migración SQL;
2. tipos TypeScript;
3. servicios;
4. documentación.

## Nota sobre multi-restaurante

El modelo ya contiene `configuracion_restaurante_id` en familias y productos, pero las políticas RLS actuales conceden acceso al rol `authenticated` a nivel de tabla. Si el proyecto pasa a gestionar varios restaurantes con usuarios independientes, habrá que endurecer RLS para limitar cada sesión a su propio restaurante.
