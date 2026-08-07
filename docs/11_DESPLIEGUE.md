# 11 - DESPLIEGUE

## Objetivo
Definir cómo se distribuye, instala y conecta CartaDigitalQR.

## Arquitectura de Aplicaciones
El proyecto está formado por DOS aplicaciones independientes.

### 1. Aplicación Pública (PWA)
- **Tipo**: Progressive Web App (PWA).
- **Acceso**: Mediante QR o enlace web.
- **Instalación**: No requiere instalación obligatoria (Add to Home Screen opcional).
- **Funcionalidad**: Solo muestra la carta al cliente (solo lectura). Nunca contiene funciones administrativas.

### 2. Aplicación Privada (App Android)
- **Tipo**: Aplicación Android Nativa (APK).
- **Acceso**: Solo personal autorizado. Instalable en múltiples móviles.
- **Funcionalidad**: Requiere autenticación. Gestiona toda la información de la carta (CRUD completo).

## Base de Datos
- Las dos aplicaciones utilizan **exactamente la misma base de datos Supabase**.
- Toda la información se sincroniza automáticamente en tiempo real.

## Configuración y Multirestaurante
- La aplicación privada incluirá una pantalla de configuración para modificar la **URL de Supabase** y la **Clave Pública (Anon Key)**.
- Esta configuración queda almacenada localmente en el dispositivo.
- No será necesario modificar el código para conectar otra base de datos.
- Una única aplicación podrá utilizarse en cualquier restaurante simplemente cambiando la URL y Key.

## Objetivo Final
Crear un sistema donde la base de datos es el centro y las aplicaciones son simplemente clientes que se configuran dinámicamente para conectarse a ella.
