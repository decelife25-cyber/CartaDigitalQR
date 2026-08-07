# 018 - ARQUITECTURA GENERAL

## Objetivo
Describir la arquitectura oficial de CartaDigitalQR.

## Aplicación 1: Carta Digital Pública
**Tecnología**: React, Vite, Tailwind, PWA.
- Acceso escaneando un código QR, sin instalación obligatoria.
- Solo lectura (No modifica base de datos).

## Aplicación 2: Administración Privada
**Tecnología**: Android Nativo, Jetpack Compose.
- Instalable como APK en móviles del personal.
- Requiere autenticación.
- Todas las operaciones CRUD.

## Base de Datos, Sincronización y Multirestaurante
- **Supabase**: Base de datos compartida única.
- **Sincronización**: Automática, los cambios del Android se ven en la PWA.
- **Multirestaurante**: Cambiar de restaurante implica solo actualizar la URL y Key en la configuración de la App Privada, conectándose a una nueva instancia de Supabase.
- **Offline**: Caché de datos para lectura rápida, pero Supabase es la fuente oficial.

## Futuro
La arquitectura soporta escalabilidad (Pedidos, Modo Camarero, etc.) mediante Supabase.
