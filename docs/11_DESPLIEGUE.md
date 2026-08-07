# 11 - DESPLIEGUE

## Objetivo

Definir cómo se distribuye, instala y conecta CartaDigitalQR.

---

# Arquitectura

El proyecto está formado por DOS aplicaciones independientes.

## 1. Aplicación Pública

- Tipo: PWA.
- Acceso mediante QR o enlace web.
- No requiere instalación obligatoria.
- Puede instalarse como aplicación en Android e iPhone.
- Solo muestra la carta al cliente.
- Nunca contiene funciones administrativas.

---

## 2. Aplicación Privada

- Tipo: PWA independiente.
- Instalable en uno o varios móviles.
- Requiere autenticación.
- Acceso únicamente para administradores o empleados autorizados.
- Gestiona toda la información de la carta.

---

# Base de datos

Las dos aplicaciones utilizan exactamente la misma base de datos Supabase.

No existen bases de datos distintas.

Toda la información se sincroniza en tiempo real.

---

# Configuración de Supabase

La aplicación incluirá una pantalla de Configuración donde podrán modificarse:

- URL de Supabase.
- Clave pública (Anon Key).

La configuración quedará almacenada localmente.

No será necesario modificar el código para conectar otra base de datos.

---

# Valores iniciales

El proyecto incluirá por defecto la configuración oficial de CartaDigitalQR.

Posteriormente cualquier restaurante podrá sustituir esos datos por los suyos.

---

# Instalación

La aplicación podrá instalarse desde el navegador como PWA.

No dependerá de Google Play ni App Store.

---

# Multiusuario

La aplicación privada podrá instalarse simultáneamente en varios dispositivos.

Todos trabajarán sobre la misma base de datos.

Los cambios aparecerán inmediatamente en todos los dispositivos.

---

# Objetivo final

Una única aplicación podrá utilizarse en cualquier restaurante.

Solo será necesario cambiar:

- URL de Supabase.
- Clave pública.

Todo lo demás funcionará automáticamente.