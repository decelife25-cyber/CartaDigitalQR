# 02 - ARQUITECTURA

## Visión General
El sistema está compuesto por dos aplicaciones distintas que comparten la misma base de datos Supabase.

### 1. Arquitectura PWA (Carta Pública)
- **Tecnología**: React, Vite, Tailwind CSS.
- **Tipo**: Progressive Web App (PWA).
- **Acceso**: Código QR o enlace web.
- **Instalación**: Flujo opcional a través del navegador (Add to Home Screen).
- **Características**:
  - Sólo lectura (no modifica datos).
  - Prioridad absoluta en diseño "Mobile-First".
  - Acceso instantáneo sin descargas obligatorias.

### 2. Arquitectura de Aplicación Móvil Privada (Panel de Administración)
- **Tecnología**: Android Nativo con Jetpack Compose.
- **Tipo**: Aplicación Android (APK).
- **Acceso**: Instalación directa en los dispositivos de los administradores/empleados.
- **Características**:
  - Gestión completa (CRUD) de la base de datos (Familias, Productos, Configuración).
  - Autenticación requerida obligatoria.
  - Soporte multirestaurante dinámico mediante cambio de configuración desde el panel.

### Sincronización entre Aplicación Pública y Privada
- **Flujo**: Tiempo real basado en Supabase.
- Al actualizar un producto en la App Privada, los datos se reflejan instantáneamente en la PWA pública al recargar o mediante suscripciones de Supabase.
- No hay sincronización manual, ni exportación/importación de datos.

### Comportamiento Offline
- **PWA (Pública)**: Service workers cachean estáticos (HTML/CSS/JS/Imágenes/Fuentes) para que la carta abra más rápido en conexiones lentas. La información proviene de Supabase de manera dinámica.
- **App Privada**: Caché en memoria y local para mejorar el rendimiento, pero la confirmación de escrituras requiere red. Supabase es la fuente oficial.

### Flujo de Instalación de la Aplicación
1. **PWA**: El usuario escanea el QR. El navegador ofrece "Instalar App". El Service Worker y `manifest.json` gestionan la instalación en la pantalla de inicio del cliente.
2. **Privada**: Distribución del APK de forma privada al personal del restaurante. Instalación manual en dispositivos autorizados. En el primer uso, se configuran los datos de conexión al proyecto Supabase.
