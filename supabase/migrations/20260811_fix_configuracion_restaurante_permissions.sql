-- CartaDigitalQR: permisos de la configuración real usada por el panel.
-- La aplicación administra public.configuracion_restaurante, no public.configuracion.

begin;

grant select on table public.configuracion_restaurante to anon;
grant select, insert, update, delete on table public.configuracion_restaurante to authenticated;

alter table public.configuracion_restaurante enable row level security;

drop policy if exists "cdqr_public_select_configuracion_restaurante" on public.configuracion_restaurante;
create policy "cdqr_public_select_configuracion_restaurante"
  on public.configuracion_restaurante
  for select
  to anon
  using (activo = true);

drop policy if exists "cdqr_authenticated_all_configuracion_restaurante" on public.configuracion_restaurante;
create policy "cdqr_authenticated_all_configuracion_restaurante"
  on public.configuracion_restaurante
  for all
  to authenticated
  using (true)
  with check (true);

commit;
