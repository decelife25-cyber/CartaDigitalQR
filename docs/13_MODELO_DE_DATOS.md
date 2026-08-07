# 13 - MODELO DE DATOS

## Objetivo

Definir las entidades oficiales de CartaDigitalQR.

Toda la aplicación deberá construirse utilizando exclusivamente este modelo.

---

# Base de datos

Motor:

Supabase PostgreSQL

---

# Tablas principales

## Familias

Agrupa los productos de la carta.

Ejemplos:

- Entrantes
- Ensaladas
- Carnes
- Pescados
- Postres
- Bebidas

Cada familia podrá ordenarse.

Podrá ocultarse.

Podrá mostrarse.

---

## Productos

Cada plato pertenece a una familia.

Un producto podrá contener:

- Nombre
- Descripción
- Precio
- Imagen
- Alérgenos
- Disponible
- Destacado
- Orden

---

## Alérgenos

Catálogo oficial europeo.

Cada producto podrá tener ninguno, uno o varios alérgenos.

---

## Configuración

Almacena la configuración general.

Ejemplos:

- Nombre restaurante
- Logotipo
- Color principal
- Color secundario
- Teléfono
- Dirección
- Horario
- Web
- Redes sociales

---

## Supabase

La configuración incluirá:

- URL
- Anon Key

Podrá modificarse desde la aplicación privada.

---

# Relaciones

Familias

↓

Productos

↓

Alérgenos

---

# Principios

No duplicar información.

No guardar datos innecesarios.

Todo deberá poder ampliarse sin modificar la arquitectura.

La base de datos deberá servir para cualquier restaurante.

---

# Objetivo

El mismo programa deberá funcionar para miles de restaurantes únicamente cambiando los datos de configuración y el contenido de la base de datos.