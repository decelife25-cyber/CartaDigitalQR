# Plan futuro de Decelife y distribución segura

**Documento de continuidad del proyecto CartaDigitalQR**  
**Estado:** planificación futura. No implementar estas funciones todavía salvo que se indique expresamente.

## 1. Objetivo

Convertir la estructura actual de CartaDigitalQR en la base de un ecosistema de aplicaciones bajo una misma marca: **Decelife**.

La idea es que Carta Digital, Reservas Camborio, Mis Recetas y futuros proyectos puedan convivir bajo un único dominio y que el dominio sea una dirección estable, independiente de la tecnología concreta que haya detrás.

Ejemplo previsto:

```text
www.decelife.com
├── /cartadigital
├── /reservascamborio
├── /misrecetas
└── /futuros-proyectos
```

La nomenclatura final de las rutas se decidirá cuando se contrate/configure el dominio.

## 2. Dominio estable y QR

La intención es contratar un único dominio, por ejemplo `decelife.com`, y utilizar una dirección estable para cada aplicación.

Para Carta Digital, el QR físico debería apuntar a una dirección estable de Decelife, por ejemplo:

```text
https://www.decelife.com/cartadigital
```

La ventaja buscada es que el QR no dependa directamente de una URL de GitHub Pages o de una implementación concreta.

Si en el futuro cambia la aplicación que sirve la carta, la infraestructura puede hacer que la misma dirección estable siga llevando a la nueva versión. De esa forma no habría que sustituir los QR físicos mientras el dominio/ruta pública permanezca igual.

**Importante:** cambiar el destino detrás de la dirección estable es posible; cambiar el dominio o la ruta pública sí exigiría actualizar los QR.

## 3. Página central de descargas

Se quiere crear posteriormente una sección del dominio, por ejemplo:

```text
https://www.decelife.com/download
```

Su función inicial NO será crear un sistema comercial de licencias completo. Su función será permitir que una persona autorizada pueda descargar de forma cómoda el APK correspondiente desde un móvil, sin tener que recibir el archivo por correo, WhatsApp o almacenamiento manual.

Ejemplo:

```text
DESCARGAS DECELIFE

Carta Digital — Camborio
Aplicación privada de gestión
[ DESCARGAR APK ]
```

Más adelante podrán añadirse otras aplicaciones.

## 4. Dónde guardar los APK

La opción prevista inicialmente es utilizar **GitHub Releases** para almacenar/publicar las versiones de los APK de cada proyecto.

La página `www.decelife.com/download` actuaría como interfaz de distribución y enlazaría a la versión autorizada correspondiente.

No es necesario contratar un servidor de almacenamiento independiente solamente para guardar los APK.

## 5. Seguridad de Carta Digital Camborio

Este punto es prioritario porque el APK de Camborio se distribuirá inicialmente con la configuración necesaria para trabajar con la instalación de Carta Digital de Camborio.

El objetivo no es todavía controlar comercialmente cuántos restaurantes o dispositivos existen. El objetivo es evitar que una persona que consiga el APK pueda instalarlo y utilizarlo libremente fuera del restaurante autorizado.

### Protección prevista en dos capas

#### Capa A — Distribución

La descarga desde `/download` debe requerir algún mecanismo de autorización. Inicialmente puede ser un código de acceso/descarga entregado únicamente al destinatario autorizado.

#### Capa B — Activación de la aplicación

Al instalar el APK, la primera ejecución debe poder exigir un **código de instalación/activación**.

Flujo previsto:

```text
Página de descarga
       ↓
Autorización de descarga
       ↓
Descargar APK
       ↓
Instalar APK
       ↓
Código de instalación
       ↓
Aplicación activada
       ↓
PIN normal de usuario
       ↓
Panel privado
```

El código de instalación no debe plantearse como sustituto de la seguridad del backend.

## 6. Seguridad de Supabase

La protección real de los datos debe estar en Supabase y en las políticas de acceso correspondientes.

Regla fundamental:

**Nunca introducir una `service_role key` ni una credencial privilegiada de Supabase dentro del APK.**

La aplicación debe utilizar solamente las credenciales/clientes que sean apropiados para el entorno público y el acceso a los datos debe quedar protegido mediante autenticación/autorización y RLS cuando corresponda.

La clave de instalación sirve para controlar el uso de la aplicación; no debe considerarse una barrera suficiente para proteger directamente la base de datos.

## 7. Varios móviles

El diseño futuro debe permitir que una misma instalación de restaurante pueda funcionar en varios móviles autorizados.

Ejemplo inicial:

```text
Camborio
├── Móvil 1 — autorizado
├── Móvil 2 — autorizado
└── Móvil 3 — autorizado
```

No se establece todavía un límite comercial de dispositivos. Eso pertenece a una futura fase de licencias si algún día se estandariza el producto para otros restaurantes.

## 8. Futuro sistema de licencias

No implementar ahora.

Si CartaDigitalQR se convierte posteriormente en un producto para múltiples restaurantes, se podrá añadir una capa de gestión centralizada con conceptos como:

- restaurante/cliente;
- aplicación contratada;
- código de instalación;
- dispositivos autorizados;
- activaciones;
- versiones permitidas;
- revocación de dispositivos;
- renovación/caducidad si fuese necesaria;
- configuración de Supabase por restaurante;
- distribución de versiones.

Esto debe diseñarse como una fase independiente para no complicar la versión actual de Camborio.

## 9. Estandarización futura de Supabase

La versión actual está orientada al restaurante Camborio.

Si posteriormente se convierte en producto multi-restaurante, la configuración específica de Supabase no debería quedar rígidamente integrada en el código de cada APK.

El objetivo futuro será disponer de un mecanismo seguro para que cada instalación/restaurante quede asociada a su propio proyecto/base de Supabase, evitando compartir los datos de Camborio con otros clientes.

**No implementar esta estandarización todavía.** Primero terminar y poner en funcionamiento la instalación actual de Camborio.

## 10. Orden recomendado de trabajo

### Fase actual

1. Terminar CartaDigitalQR para Camborio.
2. Revisar funcionamiento completo.
3. Preparar APK privado.
4. Probarlo en los dispositivos reales del restaurante.
5. Verificar correctamente Supabase, autenticación y permisos.

### Fase siguiente

6. Comprar/configurar `decelife.com`.
7. Configurar `www.decelife.com`.
8. Configurar la ruta estable de Carta Digital.
9. Hacer que el QR utilice esa dirección estable.
10. Crear `/download`.
11. Publicar el APK mediante GitHub Releases.
12. Proteger la descarga y la activación con un mecanismo sencillo.

### Fase futura

13. Estandarizar Carta Digital para otros restaurantes.
14. Separar configuración/credenciales de Supabase por instalación.
15. Crear sistema de licencias y dispositivos si realmente resulta necesario.
16. Incorporar Reservas, Mis Recetas y otros proyectos al ecosistema Decelife.

## 11. Principio importante de continuidad

Este documento es un **guion de futuro**, no una orden para implementar todo inmediatamente.

Si otro chat retoma el proyecto, debe:

1. leer este documento;
2. comprobar el estado real de `main` y de los PR actuales;
3. distinguir claramente entre funciones ya implementadas y planificación futura;
4. no implementar las fases futuras sin confirmación expresa del usuario.

El objetivo es evitar que un cambio de chat provoque que haya que volver a explicar todo el planteamiento.