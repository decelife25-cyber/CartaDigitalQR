-- CartaDigitalQR: URL externa del programa de reservas de mesa.
-- Se guarda por restaurante para que el boton RESERVAR MESA de la portada
-- pueda abrir la aplicacion de reservas configurada por cada restaurante.

begin;

alter table public.configuracion_restaurante
  add column if not exists url_reservas_mesa text;

comment on column public.configuracion_restaurante.url_reservas_mesa is
  'URL externa de la aplicacion utilizada para reservar mesa desde la carta digital';

commit;
