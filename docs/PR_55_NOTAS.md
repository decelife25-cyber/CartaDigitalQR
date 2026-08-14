# PR 55 — Portada: botones y horario

## Objetivo
Mejorar exclusivamente la portada publica de CartaDigitalQR para:

1. Dar mas espacio al boton `Reservar mesa` pasando la distribucion inferior de 25/50/25 a 30/40/30.
2. Mostrar el horario configurado sin aumentar permanentemente la altura de la portada, mediante un pequeno icono de reloj y un modal.

## Criterios
- No modificar Supabase ni su estructura.
- Reutilizar el campo `horario` que ya existe en `configuracion_restaurante`.
- El icono de reloj solo aparece si existe horario configurado.
- El horario se muestra en un modal sencillo, legible y adaptado a movil.
- Mantener intactos Reservar mesa, Ver carta, Llamar, la pizarra y la barra de direccion/telefono.
