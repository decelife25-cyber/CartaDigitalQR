# PLAN DE DESARROLLO

Este documento establece la hoja de ruta oficial del proyecto CartaDigitalQR, diviendo el trabajo en fases progresivas, desde la infraestructura hasta el pulido final.

---

## Fase 1: Arquitectura
- **Objetivo:** Inicializar el proyecto base, estructurar la carpeta `/src`, definir el enrutamiento principal (React Router, Next.js u otra herramienta seleccionada), configurar las herramientas (Vite, ESLint, Tailwind) y preparar el entorno para ser una PWA (Progressive Web App).
- **Archivos afectados:** `package.json`, archivos de configuración (Vite/Next), enrutador principal y layout base.
- **Dependencias:** Node.js, framework frontend elegido.
- **Criterios de aceptación:** El proyecto compila sin errores, muestra una pantalla base (ej. "Hello World") y la estructura de carpetas coincide con el estándar.

## Fase 2: Conexión Supabase
- **Objetivo:** Integrar `@supabase/supabase-js` y configurar la conexión para que funcione con múltiples restaurantes a través de un proveedor de contexto (Context Provider).
- **Archivos afectados:** Servicio de Supabase, variables de entorno, proveedor de estado general.
- **Dependencias:** Cliente oficial de Supabase, Fase 1.
- **Criterios de aceptación:** La aplicación es capaz de realizar una consulta básica de prueba exitosa a una base de datos real en Supabase, utilizando la URL y clave pública anónima proporcionadas.

## Fase 3: Pantalla pública
- **Objetivo:** Desarrollar la portada inicial que verá el cliente al escanear el QR, recuperando la configuración de Supabase.
- **Archivos afectados:** Componente `Portada`, servicio de lectura de `configuracion`.
- **Dependencias:** Fase 2.
- **Criterios de aceptación:** La pantalla debe ser idéntica a la referencia de portada (`001_PORTADA.md`), cargando nombre, imagen y estilos desde Supabase.

## Fase 4: Familias
- **Objetivo:** Implementar la visualización de la lista de categorías o familias en la carta pública.
- **Archivos afectados:** Componente `Familias`, repositorio/servicio de familias.
- **Dependencias:** Fase 3, datos en tabla `familias`.
- **Criterios de aceptación:** Se muestran todas las familias visibles, respetando el orden. Idéntico a la imagen oficial (`002_FAMILIAS.md`).

## Fase 5: Listado productos
- **Objetivo:** Mostrar los productos correspondientes a la familia seleccionada por el cliente.
- **Archivos afectados:** Componente `ListadoPlatos`, componente de tarjeta de plato, servicio de `productos`.
- **Dependencias:** Fase 4.
- **Criterios de aceptación:** Listado móvil fluido. Los productos muestran fotos (o genéricas), nombres, precios y disponibilidad según `003_LISTADO_PLATOS.md`.

## Fase 6: Ficha producto
- **Objetivo:** Mostrar el detalle ampliado de un plato al pulsar sobre él en el listado.
- **Archivos afectados:** Componente `FichaPlato`.
- **Dependencias:** Fase 5.
- **Criterios de aceptación:** La pantalla sigue las pautas estrictas de `004_FICHA_PLATO.md`, con botón grande de "Añadir a mi selección" e información completa, sin cortar textos.

## Fase 7: Buscador
- **Objetivo:** Implementar la lupa y funcionalidad de búsqueda instantánea de platos.
- **Archivos afectados:** Componente `Buscador`.
- **Dependencias:** Fase 5.
- **Criterios de aceptación:** Búsqueda al escribir (instantánea) de platos (por nombre o descripción). Idéntico a `005_BUSCADOR.md`.

## Fase 8: Mi selección
- **Objetivo:** Crear un gestor local del "carrito" del cliente para que pueda enseñar el resumen al camarero.
- **Archivos afectados:** Componente `MiSeleccion`, manejador de estado global/local (Zustand, Context).
- **Dependencias:** Fase 6.
- **Criterios de aceptación:** Permite aumentar/disminuir cantidades, calcula el total y tiene un botón "Mostrar al camarero". NO hace peticiones a cocina ni requiere pago, basado en `006_MI_SELECCION.md`.

## Fase 9: Panel privado
- **Objetivo:** Proteger las rutas privadas con autenticación y crear la portada de trabajo `Home`.
- **Archivos afectados:** Capa Auth, componente `HomePrivado`, enrutador privado.
- **Dependencias:** Fase 2 (Auth Supabase).
- **Criterios de aceptación:** Ingreso mediante login. Pantalla con botones grandes de acciones, sin paneles de escritorio. Basado en `007_HOME_PRIVADO.md`.

## Fase 10: Familias privadas
- **Objetivo:** Permitir gestionar (crear, editar, borrar, ocultar, reordenar) las familias desde el móvil.
- **Archivos afectados:** Componentes de gestión de Familias, servicios CRUD.
- **Dependencias:** Fase 9.
- **Criterios de aceptación:** Lista rápida y compacta de familias con contador de platos. Cambios persistentes en base de datos. Referencia `008_FAMILIAS_PRIVADO.md`.

## Fase 11: Productos
- **Objetivo:** Implementar la pantalla core del restaurante: listar, buscar y filtrar rápidamente todos los platos.
- **Archivos afectados:** Componente `ListadoProductosPrivado`.
- **Dependencias:** Fase 10.
- **Criterios de aceptación:** Carga y scroll casi instantáneos de cientos de platos. Botones rápidos para ocultar/editar. Referencia `009_PRODUCTOS.md`.

## Fase 12: Editor
- **Objetivo:** Pantalla específica para crear y editar todos los detalles de un producto.
- **Archivos afectados:** Componente `EditorProducto`.
- **Dependencias:** Fase 11.
- **Criterios de aceptación:** Carga muy rápida, sin asistentes de múltiples pasos. Guardado manual y con retorno al scroll exacto del listado tras guardar. Referencia `010_EDITOR_PRODUCTO.md`.

## Fase 13: Alérgenos
- **Objetivo:** Gestionar el catálogo de alérgenos y permitir asociarlos a los productos en el editor.
- **Archivos afectados:** Componente `GestionAlergenos`, modificaciones en `EditorProducto`.
- **Dependencias:** Fase 12.
- **Criterios de aceptación:** CRUD completo de alérgenos adaptado a móvil. Guardado inmediato en la tabla relacional desde el editor. Referencia `011_ALERGENOS.md`.

## Fase 14: Configuración
- **Objetivo:** Implementar la pantalla central de ajustes de restaurante (colores, logo, datos de contacto).
- **Archivos afectados:** Componente `Configuracion`, servicio general.
- **Dependencias:** Fase 9.
- **Criterios de aceptación:** Formulario largo sin guardado automático. Todas las modificaciones deben reflejarse en la app pública al pulsar "Guardar". Referencia `013_CONFIGURACION.md`.

## Fase 15: Optimización
- **Objetivo:** Mejorar tiempos de carga de imágenes, refinar los refetch de la base de datos para no consumir datos innecesarios y pulir las animaciones.
- **Archivos afectados:** Componentes con imágenes y utilidades de carga diferida (lazy load).
- **Dependencias:** Todas las fases anteriores.
- **Criterios de aceptación:** Cargas inmediatas; imágenes pesadas no deben bloquear la interfaz; comportamiento fluido al 100% en Android de gama baja/media.

## Fase 16: Pruebas finales
- **Objetivo:** Validación QA exhaustiva, probar flujos con múltiples instancias de restaurantes (Multirestaurante).
- **Archivos afectados:** Tests, documentación final.
- **Dependencias:** Fase 15.
- **Criterios de aceptación:** La misma aplicación puede cambiar de URL Supabase + Clave y mostrar instantáneamente la carta de un restaurante totalmente distinto, confirmando la modularidad descrita en `14_MULTIRESTAURANTE.md`.