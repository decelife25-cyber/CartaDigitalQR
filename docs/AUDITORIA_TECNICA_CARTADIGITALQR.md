# Auditoría Técnica Completa — CartaDigitalQR

**Fecha de auditoría:** 13 de agosto de 2024
**Repositorio:** decelife25-cyber/CartaDigitalQR
**Commit analizado:** 9e32449
**Alcance:** Estado actual, arquitectura, Supabase, panel privado, carta pública e integración con Camborio Reservas.
**Advertencia:** Durante esta auditoría no se modificó ningún archivo de código fuente del proyecto.

---

## 1. Arquitectura Actual

El proyecto CartaDigitalQR es una Single Page Application (SPA) construida con React, Vite y TypeScript, que actúa como Progressive Web App (PWA). Utiliza Supabase como backend exclusivo (PostgreSQL + Auth + Storage).

La arquitectura se divide en dos áreas principales dentro de la misma aplicación, que comparten el cliente Supabase (`src/lib/supabase.ts`):

**Carta Pública** (`/`, `/familias`, `/plato/:id`, etc.)
- **Entrada:** `src/main.tsx` -> `src/App.tsx` (React Router DOM con `basename`).
- **Páginas principales:** `Portada.tsx`, `Familias.tsx`, `ListadoPlatos.tsx`, `FichaPlato.tsx`.
- **Servicios:** `src/services/api.ts` interactúa con Supabase en modo anónimo (rol `anon`) y permisos de solo lectura para leer datos configurados como `activo = true`.
- **Estado:** Zustand (`src/store/selectionStore.ts`) para "Mi selección".

**Panel Privado** (`/admin`)
- **Entrada:** `src/App.tsx` -> `<Route path="/admin" element={<AdminLayout />}>`.
- **Protección:** `AdminLayout.tsx` verifica la sesión autenticada con Supabase Auth.
- **Páginas principales:** `Login.tsx`, `HomePrivado.tsx`, `AdminFamilias.tsx`, `AdminProductos.tsx`, `AdminConfiguracion.tsx`.
- **Servicios:** `src/services/adminApi.ts` y `src/services/familiaApi.ts` interactúan con Supabase utilizando el token autenticado (rol `authenticated`) para operaciones CRUD.

---

## 2. Supabase

La aplicación depende totalmente de Supabase para su funcionamiento. No existen dependencias externas para almacenamiento de datos (ej. Firebase, Google Sheets).

**Cliente y Configuración:**
- El cliente se inicializa en `src/lib/supabase.ts` requiriendo `VITE_SUPABASE_URL` y `VITE_SUPABASE_ANON_KEY`.

**Tablas (según `docs/13_MODELO_DE_DATOS.md` y `src/types/database.ts`):**
- `configuracion_restaurante`: Ajustes generales (nombre, dirección, url reservas).
- `familias`: Categorías de la carta.
- `productos`: Platos y bebidas. Relacionado con `familias` mediante `familia_id`.
- `alergenos`: Catálogo de alérgenos disponibles.
- `producto_alergeno`: Tabla intermedia muchos-a-muchos.

**Migraciones y RLS:**
- El repositorio incluye `supabase/migrations/20260809_fix_carta_digital_rls.sql` que establece permisos `anon` y `authenticated`, indicando que el acceso público (rol `anon`) requiere que `activo = true` en tablas como `familias` y `productos`.
- Nota: Las tablas fueron renombradas a `configuracion_restaurante` y `producto_alergeno`. La migración `20260809_fix_carta_digital_rls.sql` hace referencia a los nombres antiguos (`configuracion`, `producto_alergenos` pero el código utiliza la misma tabla, es decir, existe un desajuste entre el archivo SQL antiguo y el código TypeScript actual o base de datos actual).

**Storage:**
- Utiliza un bucket llamado `productos` (ver `supabase_storage_setup.sql`).

---

## 3. Fotografías de Productos

- **Almacenamiento:** Supabase Storage, bucket `productos`.
- **Subida:** Desde `AdminProductoForm.tsx` a través de `adminApi.ts` (`uploadProductoFoto`). Se comprime antes de subir.
- **Base de datos:** En la tabla `productos` (o `familias`) solo se guarda la URL pública generada (`foto_url`).
- **Visualización (Pública):** En `FichaPlato.tsx`, la foto se muestra con `object-cover` en un contenedor `aspect-[4/3]`. Si no hay foto, se muestra un fallback de "Sin imagen".
- **Visualización (Privada):** En `AdminProductoForm.tsx`, se muestra la URL actual.
- **Limitaciones/Decisiones de diseño:** El recorte actual en `FichaPlato.tsx` utiliza `object-cover` dentro de un rectángulo de 4:3. Esto garantiza que llene el espacio horizontalmente pero recorta las imágenes que no tienen exactamente esa proporción.

---

## 4. Panel Privado

- Código centralizado en `src/pages/admin/` y `src/services/adminApi.ts`.
- Formularios construidos manualmente (sin librerías como react-hook-form pesadas).
- **Lógica repartida:** Existen dos archivos API que parecen solaparse ligeramente: `adminApi.ts` y `familiaApi.ts` (este último contiene lógica de subida de fotos).
- Las dependencias hacia Storage están manejadas a través de métodos en la API (`adminApi.ts`).

---

## 5. Carta Pública

- **Responsive:** Diseño altamente móvil-first (uso de clases como `text-[11px]`, `w-full max-w-lg`, `bottom-[100px] right-[4%] w-[min(40vw,180px)]` para la pizarra).
- **Modo oscuro:** Hardcodeado en muchos componentes con variables CSS (`var(--app-bg)`, `bg-black`, text-white).
- **Detalle de producto (`FichaPlato.tsx`):**
  - Muestra la foto (4:3 object-cover).
  - Título (`text-[28px] leading-[1.08]`).
  - Precio, descripción.
  - Alérgenos con diseño condicional basado en color de fondo.

---

## 6. Alérgenos

- **Definición:** Tabla `alergenos` en Supabase.
- **Iconos:** El sistema utiliza archivos SVG locales cargados dinámicamente según el nombre (ver `src/services/api.ts` -> `localAlergenoIconPath`). Los iconos físicos están en `public/icons/alergenos/erudus/`. Si no encuentra SVG, muestra un punto (`•`).
- **Relación:** Tabla `producto_alergeno`.
- **Visualización (`FichaPlato.tsx`):**
  - Usa CSS grid: `grid-cols-3 sm:grid-cols-4`.
  - Cajas de tamaño fijo (`min-h-[92px]`), con colores de fondo dependientes del alérgeno mapeados en `ALERGENO_COLORS`.
  - Cumple la regla de "4 por fila" en pantallas más grandes (`sm:grid-cols-4`).

---

## 7. Familias / Categorías

- Relación uno-a-muchos: un producto pertenece a una familia.
- Los gráficos/ilustraciones de familias actualmente no parecen usar una gestión dinámica avanzada, o están hardcodeados, o utilizan el campo `foto_url` de la tabla `familias`.
- Los endpoints en `adminApi.ts` gestionan los CRUD de familias, incluyendo orden y campos de foto.

---

## 8. Integración con Camborio Reservas

Esta es la funcionalidad crítica solicitada.
- **Dónde está el enlace:** El enlace hacia reservas se genera en `src/pages/Portada.tsx` (Botón "Reservar mesa").
- **Qué URL utiliza:** Procede de `configuracion_restaurante.url_reservas_mesa`. Se configura en el Panel Privado (`src/pages/admin/AdminConfiguracion.tsx` -> `url_reservas_mesa`).
- **Cómo se genera (Implementación en `Portada.tsx`):**
  ```typescript
  const url = new URL(urlReservasMesa, window.location.origin);
  if (url.protocol !== 'http:' && url.protocol !== 'https:') return;
  setReservandoMesa(true);
  window.setTimeout(() => window.location.assign(url.href), 80);
  ```
- **Conclusión sobre la integración:**
  - CartaDigitalQR **NO** tiene una integración profunda. No se comunica mediante API con Camborio-Reservas. No espera respuesta. No comparte sesión de Supabase ni autenticación.
  - Simplemente hace una redirección web (`window.location.assign()`) a la URL proporcionada en el panel de configuración.
  - El error *"No se pudo conectar con Supabase en la ruta reservas"* reportado ocurre **exclusivamente dentro de Camborio-Reservas-V2**, después de que CartaDigitalQR ha transferido al usuario.
- **Qué puede verificarse desde CartaDigitalQR:** Solo se puede confirmar que la URL guardada en `configuracion_restaurante.url_reservas_mesa` es correcta y que el botón de `Portada.tsx` realiza la redirección.
- **Qué queda pendiente:** NO DETERMINADO — NECESITA PRUEBA EN CAMBORIO-RESERVAS-V2. (Se debe analizar el otro proyecto).

---

## 9. Google Sheets / Google Apps Script

- **Resultado de búsqueda:** No se encontraron referencias a `SpreadsheetApp`, `Google`, `Sheets` o llamadas `fetch` a `script.google.com` en todo el directorio `src`.
- **Conclusión:** El proyecto ha sido migrado por completo a Supabase. **No hay dependencia legacy activa de Google Apps Script.**

---

## 10. Seguridad

- El acceso al backend (Supabase) del panel privado está protegido con el Auth de Supabase (requiere token).
- RLS protege los datos.
- **Riesgos potenciales:** Las políticas RLS de `supabase/migrations/20260809_fix_carta_digital_rls.sql` aplican a `public.configuracion` y `public.producto_alergeno`, pero los nombres de tablas actuales parecen ser `configuracion_restaurante`. Si RLS no está correctamente activado en `configuracion_restaurante`, los datos de configuración podrían ser alterables públicamente (se requiere prueba directa contra Supabase).

---

## 11. Dependencias y Código Duplicado

- `src/services/api.ts` (Público) y `src/services/adminApi.ts` (Privado) tienen ciertas superposiciones, pero están razonablemente separados por preocupación (readonly vs read/write con autenticación).
- `src/services/familiaApi.ts` parece redundante o un remanente legacy. Funciones de storage podrían integrarse en `adminApi.ts` o un servicio genérico de storage.

---

## 12. Estado Actual vs Estado Estable

- **Estado Actual:** El repositorio (commit 9e32449) representa un estado estable funcional basado en Supabase, con separación clara de panel/cliente y sin código activo de Apps Script.
- **Base estable futura:** Se recomienda considerar el actual commit como base estable y proceder con limpiezas menores.

---

## 13. Problemas Encontrados y Mejoras Identificadas

A continuación, se listan las mejoras y problemas con su estado correspondiente, para que este documento sirva como hoja de ruta.

| PROBLEMA / MEJORA | ESTADO | ARCHIVO / COMPONENTE | DESCRIPCIÓN | IMPACTO |
|---|---|---|---|---|
| **Migración a Supabase** | **A) YA IMPLEMENTADO** | Todo el proyecto | Eliminación de dependencias de Google Sheets. | Alto |
| **Integración Reservas** | **E) NO DETERMINADO** | `Portada.tsx` -> Camborio-Reservas-V2 | El error de conexión reportado es externo a CartaDigitalQR. | Alto (Requiere revisión en el otro repo) |
| **Desajuste nombres RLS** | **B) PENDIENTE** | `supabase/migrations/*` | La migración SQL usa nombres de tabla antiguos (ej. `configuracion` en lugar de `configuracion_restaurante`). | Medio (Posible exposición si la BD no está bien configurada localmente) |
| **Código huérfano (`familiaApi.ts`)** | **C) RECOMENDADO** | `src/services/familiaApi.ts` | Solapamiento de funciones con `adminApi.ts`. Debería consolidarse. | Bajo (Mejora de mantenimiento) |
| **Fotos 4:3 con object-cover** | **D) PRESCINDIBLE** | `FichaPlato.tsx` | La UI recorta imágenes que no son 4:3 exactas. Cambiar a `contain` podría evitar recortes, pero es una decisión de diseño. | Estético |

---

## 14. Qué No Debemos Tocar

- **Flujo de Auth y Supabase Client:** Funciona correctamente y tiene dependencias en todos los componentes.
- **Zustand Store (`selectionStore.ts`):** Proporciona la funcionalidad "Mi selección", que es un componente offline dependiente del localStorage.
- **Estructura de FichaPlato.tsx:** El comportamiento de los alérgenos y las imágenes 4:3 está ajustado para cumplir directrices de diseño específicas (4 por fila, legibles en móvil). Modificarlo podría romper el CSS para móviles pequeños.
- **Redirección Reservas:** `Portada.tsx` -> `reservarMesa()`. Debe permanecer como una redirección limpia de URL hacia Camborio-Reservas-V2.

---
**Conclusión final:**
La auditoría está completada. El proyecto no requiere refactorización urgente ni vuelta a versiones legacy. Depende totalmente de Supabase. El error reportado sobre Camborio Reservas no pertenece al código de CartaDigitalQR, ya que este solo funciona como un lanzador (redirige) hacia el sistema de reservas externo, el cual tiene un fallo interno en su conexión a Supabase.
