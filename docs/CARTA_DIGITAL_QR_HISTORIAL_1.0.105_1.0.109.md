# CartaDigitalQR — Autoridad histórica 1.0.105 → 1.0.109

> **Documento de referencia histórica del proyecto.**
>
> Punto estable actual: **1.0.105**  
> Commit estable: `1f52e5f786fbea2d10b1983db6e0da00b2d698ef`  
> Rama de respaldo: `backup-before-stable-reset-20260824` (**NO modificar**).

## Propósito

Este documento conserva el inventario histórico de correcciones y mejoras realizadas después de 1.0.105 y antes del rollback. Debe consultarse antes de implementar de nuevo una funcionalidad para evitar perder una corrección ya probada o inventar una solución diferente de la que funcionó históricamente.

**No es código ejecutable ni una orden de aplicar automáticamente todos los cambios.** Es documentación de referencia.

---

## 1.0.106 — Biblioteca y programación de portadas

**PR histórico:** #89 — `feat: biblioteca y programación de portadas — 1.0.106`

### Correcciones

- Biblioteca de hasta 10 portadas por restaurante.
- Conserva las portadas existentes.
- Subir, activar, editar, programar y eliminar portadas.
- Una sola portada activa.
- La portada activa se identifica como **ACTUAL**.
- La portada habitual/original se conserva como **Habitual** cuando corresponde.
- Activar una portada no requiere volver a subir la imagen.
- Una portada activa no se puede eliminar accidentalmente; primero hay que activar otra.
- Programación mediante selectores de fecha/hora.
- Confirmación antes de guardar cambios de Configuración.
- Botón Guardar desactivado cuando no hay cambios.
- QR con un único enlace de carta, evitando duplicar innecesariamente dominio/enlace.
- Descarga del QR en PNG.
- Imágenes de portadas en Supabase Storage.
- Metadatos de portadas en `portadas_carta`.

### Archivos históricos relevantes

- `android/app/src/main/java/com/decelife/cartadigitalqr/data/PortadasRepository.kt`
- `android/app/src/main/java/com/decelife/cartadigitalqr/navigation/AppNavigation.kt`
- `android/app/src/main/java/com/decelife/cartadigitalqr/screens/ConfiguracionScreen.kt`
- `android/app/src/main/java/com/decelife/cartadigitalqr/screens/PortadasScreen.kt`
- `src/components/admin/PortadasManager.tsx`
- `src/pages/Portada.tsx`
- `src/pages/admin/AdminConfiguracion.tsx`
- `supabase/migrations/20260822_add_portadas_carta.sql`

### Estado para recuperación

**RECUPERAR**, pero no recrear la estructura/datos de Supabase si ya existen.

---

## 1.0.107 — Programación de fecha/hora

### Problema

La primera versión de la biblioteca necesitaba completar correctamente la programación con fecha y hora y rechazar programaciones anteriores al momento actual.

### Corrección histórica

Commit relevante:

`ec8c56621113d6a5b0631924d53776386d075339`

Mensaje: `fix(android): add time scheduling and reject past dates`

### Comportamiento esperado

- Selección de fecha y hora.
- No permitir seleccionar una fecha/hora pasada.
- Mantener las programaciones futuras.
- Conservar la lógica de biblioteca de portadas de 1.0.106.

### Estado para recuperación

**RECUPERAR**, integrado con la biblioteca de portadas y no como una solución nueva independiente.

---

## 1.0.108 — Actualización automática de portada programada

**PR histórico:** #93 — `fix(android): actualizar automáticamente portada programada — 1.0.108`

### Problema

La pantalla Portadas calculaba correctamente qué portada debía estar activa según la hora, pero si permanecía abierta durante el cambio horario el indicador podía seguir mostrando la portada anterior hasta recargar.

### Corrección histórica

Commit relevante:

`3cc71d75cf63a2c03e27a6a2e6c0810393d311e5`

La pantalla refrescaba el estado de portadas periódicamente y volvía a evaluar la ventana programada, actualizando automáticamente el indicador **ACTUAL**.

- Refresco periódico mientras Portadas está abierta.
- Reevaluación de la programación.
- Actualización automática del indicador.
- No modifica la lógica de fechas ni la base de datos.

### Estado para recuperación

**RECUPERAR** junto con la biblioteca de portadas.

---

## 1.0.109 — Portada efectiva exactamente a la hora programada

Commit histórico relevante:

`25368d54afc487165c02f0bb1ed454a38797d95c`

Mensaje: `fix(android): make scheduled cover effective at selected time`

### Corrección

`PortadasRepository` incorporó la determinación de la portada efectiva mediante una función equivalente a `effectiveId()`:

- comprueba `programada_desde`;
- comprueba `programada_hasta`;
- compara con el instante actual;
- selecciona la programación válida más reciente;
- si no hay una programación válida, utiliza la portada marcada como activa.

Después se fijó la versión 1.0.109 mediante el commit histórico `71c33b460f0433ec0c2b3827360cf87cd22d050a`.

### Validación histórica importante

La programación de portadas **llegó a funcionar correctamente y fue comprobada por el usuario**:

- se activa exactamente a la hora programada;
- se desactiva al terminar el periodo.

**No inventar una nueva solución de programación.** Esta implementación histórica debe ser la referencia para cualquier recuperación.

### Estado para recuperación

**RECUPERAR EXACTAMENTE COMO REFERENCIA HISTÓRICA.**

---

## PWA — ESPECIALIDAD / SUGERENCIA / nombres largos

Commits históricos:

- `74e8472bb83224572717050542eba809d2da7b1b` — `fix: ajustar tarjetas públicas de productos`
- `7e5f2f4fd7c134be4e7bf3fc2fbca9daa063f9c5` — `fix: mejorar textos largos y etiquetas de productos`

### Correcciones

- ESPECIALIDAD centrada respecto a la zona de la fotografía/tarjeta.
- SUGERENCIA centrada de la misma forma.
- Indicadores visualmente equilibrados.
- Nombres largos de productos con más espacio.
- Permitir hasta tres líneas cuando sea necesario.
- Guionado automático en español cuando proceda.
- Evitar que el nombre invada precio u otros elementos.
- No truncar texto que pueda mostrarse correctamente en una tercera línea.
- Mantener la tarjeta limpia.
- No romper filtros, familias ni productos.

### PR histórico de referencia

**PR #95** — `fix(public): centrado de etiquetas y ajuste de pizarra — 1.0.109`

El PR #95 documenta la solución final de estas pruebas, pero **no debe recuperarse completo automáticamente** porque quedó abierto y contiene cambios acumulados de otros bloques.

### Estado para recuperación

**RECUPERAR SOLO LA PARTE PWA NECESARIA.**

---

## PWA — Pizarra

### Problema

La pizarra podía aparecer inicialmente con el texto exageradamente grande y corregirse después de ampliarla/reducirla.

### Corrección histórica

La solución final documentada en PR #95 recalculaba el tamaño después de cargar la fuente y durante cambios de tamaño:

- `document.fonts.ready`;
- `ResizeObserver`;
- reajuste retardado;
- cálculo del tamaño dentro de un `requestAnimationFrame`;
- mantenimiento de Patrick Hand SC como fuente manuscrita principal.

### Estado para recuperación

**RECUPERAR SOLO LA CORRECCIÓN DE LA PIZARRA.**

No cambiar innecesariamente el diseño que ya funcionaba.

---

## Android — sesiones / JWT

**PR histórico:** #92 — `fix(android): refresh Supabase session before requests`

### Problema

Tras permanecer tiempo sin entrar podían aparecer mensajes HTTP 401 / `JWT expired`. Al refrescar la aplicación volvía a funcionar. Los errores internos resultaban demasiado alarmantes para el usuario.

### Solución histórica

El PR #92 introdujo una comprobación equivalente a `SupabaseAuth.ensureValidSession()` antes de peticiones REST y Storage:

- comprobar expiración del token;
- renovar silenciosamente cuando esté próximo a caducar;
- usar el refresh token cuando sea necesario;
- evitar enviar JWT caducados.

Archivos históricos:

- `android/app/src/main/java/com/decelife/cartadigitalqr/data/SupabaseAuth.kt`
- `android/app/src/main/java/com/decelife/cartadigitalqr/data/SupabaseRepository.kt`

### Estado

**RECUPERAR COMO BLOQUE INDEPENDIENTE.**

El PR #92 quedó abierto; no debe asumirse que su código ya está en 1.0.105.

---

## Configuración — Guardar

La solución histórica de 1.0.106 establecía:

- detectar si realmente hay cambios;
- Guardar desactivado si no hay cambios;
- al pulsar Guardar con cambios, mostrar modal de confirmación;
- **Guardar** en el modal aplica los cambios;
- **Cancelar** cierra el modal sin guardar nada;
- no guardar antes de la confirmación.

**Estado: RECUPERAR.**

---

## Configuración — QR

La configuración histórica perseguía:

- un único enlace real de la carta para el QR;
- no duplicar innecesariamente el dominio estable como otra URL del QR;
- QR principal estable;
- descarga del QR en PNG;
- aviso/modal antes de iniciar la descarga.

No volver a implementar un QR temporal de recuperación mediante PWA salvo que una evidencia histórica concreta demuestre que formó parte de la solución aprobada.

**Estado: RECUPERAR la solución histórica estable; NO recuperar QR temporal por defecto.**

La protección contra descargas múltiples debe verificarse antes de introducir un cambio nuevo, porque no quedó identificada como un commit histórico independiente durante la auditoría.

---

## Supabase — Portadas

La estructura de portadas ya existe en Supabase y no debe recrearse ciegamente.

Elementos históricos:

- tabla `public.portadas_carta`;
- Storage para imágenes de portada;
- relación con configuración del restaurante;
- restricciones para una sola portada activa;
- programación mediante `programada_desde` y `programada_hasta`.

En la auditoría se confirmó además que existen datos reales de portadas en Supabase.

**Estado: YA EXISTENTE — NO RECREAR NI BORRAR.**

---

## Versionado

La numeración propia de la aplicación es independiente del número de ejecución de GitHub Actions:

- 1.0.105 → VersionCode `1000105`
- 1.0.106 → VersionCode `1000106`
- 1.0.107 → VersionCode `1000107`
- 1.0.108 → VersionCode `1000108`
- 1.0.109 → VersionCode `1000109`

Nunca utilizar el `run_number` de GitHub Actions como versión de la aplicación.

El APK debe llamarse exactamente:

`carta_vX.Y.Z.apk`

Antes de entregar un APK hay que comprobar:

- versión interna;
- VersionCode;
- nombre real del archivo;
- build;
- firma;
- contenido del APK.

---

## Correcciones que NO deben recuperarse automáticamente

### PR #94 — workflow

Cambios de GitHub Actions relacionados con publicación automática de Releases/permisos de escritura.

**Estado: NO RECUPERAR** salvo decisión posterior específica.

No es una corrección funcional de CartaDigitalQR.

### QR temporal de recuperación

Fue estudiado, pero no debe volver a implementarse salvo evidencia histórica concreta de que formó parte de una versión aprobada.

**Estado: NO RECUPERAR por defecto.**

### PR #95 completo

Aunque contiene la solución final de PWA/pizarra, quedó abierto y contiene cambios acumulados.

**Estado: NO fusionar completo. Recuperar únicamente los cambios funcionales necesarios.**

---

# Orden recomendado para futuras recuperaciones

## Prioridad 1 — Portadas

1. Biblioteca de portadas.
2. Activación/cambio sin volver a subir imagen.
3. Máximo 10 y protección de portada activa.
4. Programación fecha/hora.
5. Lógica de portada efectiva de `25368d54...`.
6. Autoactualización de 1.0.108.

## Prioridad 2 — Configuración / QR

1. Guardar desactivado sin cambios.
2. Modal Guardar/Cancelar.
3. Guardar solo después de confirmar.
4. QR con enlace único.
5. PNG.
6. Modal previo a descarga.
7. Verificar específicamente la protección contra doble descarga antes de modificarla.

## Prioridad 3 — PWA

1. ESPECIALIDAD centrada.
2. SUGERENCIA centrada.
3. Nombres de hasta tres líneas.
4. Protección de precio/elementos de la tarjeta.
5. Pizarra: cálculo correcto desde el primer render.
6. Reajuste después de cargar la fuente.

## Prioridad 4 — Sesión

1. `ensureValidSession()`.
2. Renovación silenciosa.
3. Aplicación a REST y Storage.
4. Evitar mostrar errores técnicos internos de JWT al usuario.

---

# Regla de oro

**Antes de implementar cualquier corrección relacionada con estas áreas, consultar este documento y localizar el commit/PR histórico correspondiente.**

Si la funcionalidad ya fue comprobada como correcta por el usuario, especialmente la **programación de portadas**, no se debe sustituir por una solución nueva sin una razón técnica demostrada.

Este documento es **histórico y de referencia**. No implica que todos los cambios deban aplicarse de una vez ni que deban fusionarse los PR históricos completos.
