# Guía para dar acceso de escritura a GitHub desde ChatGPT/Codex

**Documento operativo para futuros chats que continúen CartaDigitalQR.**

## 1. Problema que resuelve este documento

Puede ocurrir que un chat pueda leer un repositorio de GitHub pero no pueda modificar archivos, crear ramas, abrir PR o fusionar cambios.

Eso **no se arregla simplemente pidiendo al chat que escriba**. La capacidad depende de la integración disponible en esa experiencia de ChatGPT/Codex, de la conexión/autorización de GitHub y de los permisos concedidos.

Este documento sirve como guía de diagnóstico antes de empezar a trabajar.

## 2. Primera comprobación: qué herramienta tiene el chat

Antes de modificar nada, pedir al chat:

> Comprueba qué integración de GitHub tienes disponible en esta conversación. Necesito saber si puedes solamente leer GitHub o también crear/editar archivos, crear ramas, abrir PR y fusionarlos. No intentes modificar nada todavía.

El chat debe responder con las capacidades reales de las herramientas disponibles.

### Señal importante

Si solo puede buscar/leer repositorios, **no tiene capacidad de escritura** en esa conversación.

No hay que insistir con prompts para intentar forzar una escritura que la herramienta no permite.

## 3. GitHub conectado a ChatGPT

La conexión oficial se gestiona desde:

**ChatGPT → Configuración → Aplicaciones → GitHub**

Desde ahí se conecta/autorizan los repositorios que ChatGPT puede utilizar. OpenAI indica que, al conectar GitHub, se redirige a GitHub para autorizar la aplicación y después se seleccionan los repositorios permitidos.

Referencia oficial:
https://help.openai.com/es-es/articles/11145903-connecting-github-to-chatgpt

### Si el repositorio no aparece

Comprobar:

1. que GitHub está conectado a la cuenta correcta;
2. que `decelife25-cyber/CartaDigitalQR` está entre los repositorios autorizados;
3. que no existe una restricción del workspace/administrador;
4. que el repositorio ya está disponible para la integración;
5. si acaba de conectarse, esperar unos minutos y volver a comprobar.

La sincronización/indexación y el acceso al repositorio son conceptos distintos: un repositorio autorizado puede seguir siendo accesible aunque no esté seleccionado como repositorio preferido para sincronización.

## 4. Muy importante: lectura de GitHub ≠ escritura de GitHub

La documentación oficial actual de OpenAI distingue la aplicación de GitHub de las capacidades de Codex.

La aplicación de GitHub en ChatGPT está orientada a leer, buscar, analizar y citar código. Para generar, editar y enviar cambios directamente a GitHub, OpenAI indica que hay que utilizar **Codex**.

Referencia oficial:
https://help.openai.com/es-es/articles/11145903-connecting-github-to-chatgpt

Por tanto, si un chat dice:

> "Puedo leer GitHub pero no puedo escribir"

eso puede ser correcto. No significa necesariamente que la autorización del usuario esté mal.

## 5. Si se necesita escritura: utilizar Codex o una integración con acciones de escritura

Codex es el producto/agente de programación de OpenAI destinado a escribir, revisar y publicar código.

Referencia oficial:
https://help.openai.com/es-es/articles/11369540

Al trabajar con Codex, comprobar que el repositorio de GitHub está conectado y que el entorno tiene permisos suficientes para realizar las acciones solicitadas.

No asumir que todos los chats normales tienen las mismas herramientas que Codex.

## 6. En este repositorio se ha comprobado que existe acceso de escritura en el entorno correcto

En el entorno que se utilizó para mantener CartaDigitalQR se han podido realizar acciones de GitHub como:

- leer archivos;
- crear ramas;
- crear archivos;
- actualizar archivos;
- crear Pull Requests;
- revisar Pull Requests;
- fusionar Pull Requests;
- consultar workflows y resultados de GitHub Actions.

Por tanto, si un futuro chat no puede hacer esas operaciones, **primero hay que revisar la integración/herramientas disponibles en ese chat** antes de tocar el código.

## 7. Diagnóstico rápido que debe hacer un chat nuevo

Copiar y pegar este bloque al comenzar:

```text
Estamos trabajando en el repositorio decelife25-cyber/CartaDigitalQR.

Antes de modificar nada, comprueba las herramientas de GitHub disponibles en esta conversación.

Necesito que me confirmes por separado si puedes:
1. leer archivos del repositorio;
2. crear archivos;
3. modificar archivos existentes;
4. crear ramas;
5. crear Pull Requests;
6. revisar Pull Requests;
7. ejecutar/revisar GitHub Actions;
8. fusionar Pull Requests.

No hagas ningún cambio todavía.

Si puedes leer pero no escribir, no intentes forzar la escritura mediante prompts. Explícame qué integración falta y si esta tarea debe hacerse mediante Codex u otra integración con permisos de escritura.
```

## 8. Si el chat tiene escritura

Entonces el flujo de trabajo recomendado para CartaDigitalQR es:

```text
1. Leer el estado/documentación del repositorio
        ↓
2. Revisar el código afectado
        ↓
3. Crear una rama específica
        ↓
4. Hacer un único cambio lógico
        ↓
5. Revisar el diff
        ↓
6. Ejecutar/revisar tests y checks
        ↓
7. Crear PR
        ↓
8. Revisar PR
        ↓
9. Fusionar si todo está correcto
        ↓
10. Comprobar main
```

No trabajar directamente sobre `main` salvo que se haya decidido expresamente y sea apropiado.

## 9. Si el chat NO tiene escritura

No hay que entregar credenciales personales, tokens ni claves privadas al chat para intentar solucionar el problema.

Tampoco se debe pegar en una conversación:

- Personal Access Tokens de GitHub;
- claves privadas;
- contraseñas;
- claves `service_role` de Supabase;
- secretos de CI/CD.

La solución correcta es utilizar una integración autorizada que tenga las capacidades necesarias, normalmente Codex para el trabajo de programación/escritura, o revisar la configuración de la aplicación/integración de GitHub cuando corresponda.

## 10. Sobre permisos

Aplicación/conexión y permisos de acciones son cosas distintas.

Un usuario puede tener acceso al repositorio en GitHub y, aun así, la herramienta utilizada por ChatGPT no tener una acción de escritura disponible en esa experiencia.

Además, las políticas de permisos de las aplicaciones pueden controlar si ChatGPT debe pedir confirmación antes de realizar acciones importantes.

Referencia oficial sobre aplicaciones y permisos:
https://help.openai.com/en/articles/11487775-connectors-in-chatgpt

## 11. Regla para CartaDigitalQR

Cuando un nuevo chat continúe este proyecto:

**Primero comprobar herramientas y permisos. Después actuar.**

No asumir que porque otro chat pudo crear PRs este chat también puede hacerlo.

No asumir tampoco que porque puede leer el repositorio puede escribirlo.

Si no existe escritura, informar claramente de la limitación antes de prometer un PR.

## 12. Seguridad

Este documento es una guía operativa. **No contiene ni debe contener credenciales reales.**

Si para una integración concreta se necesitan credenciales, deben introducirse únicamente mediante el mecanismo oficial de autorización/configuración de la plataforma correspondiente, nunca pegándolas en este archivo ni en un prompt.

## 13. Última comprobación conocida

En la revisión de CartaDigitalQR del 14 de agosto de 2026, el repositorio `decelife25-cyber/CartaDigitalQR` tenía `push: true` en el entorno de GitHub utilizado para realizar los últimos cambios. Esto demuestra que el entorno de trabajo utilizado en aquella sesión sí disponía de escritura.

No debe interpretarse como garantía de que todos los futuros chats tendrán automáticamente esos mismos permisos: cada conversación/experiencia debe comprobar sus herramientas reales.
