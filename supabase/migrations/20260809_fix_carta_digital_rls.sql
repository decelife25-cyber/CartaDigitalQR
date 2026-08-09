-- CartaDigitalQR: permisos mínimos necesarios para el frontend público
-- y el panel privado autenticado.
-- Ejecutar en Supabase SQL Editor una sola vez.

begin;

-- La API REST de Supabase necesita permisos SQL además de las políticas RLS.
grant usage on schema public to anon, authenticated;

grant select on table
  public.configuracion,
  public.familias,
  public.productos,
  public.alergenos,
  public.producto_alergeno
  to anon;

grant select, insert, update, delete on table
  public.configuracion,
  public.familias,
  public.productos,
  public.alergenos,
  public.producto_alergeno
  to authenticated;

-- RLS debe estar activo en todas las tablas que toca el cliente.
alter table public.configuracion enable row level security;
alter table public.familias enable row level security;
alter table public.productos enable row level security;
alter table public.alergenos enable row level security;
alter table public.producto_alergeno enable row level security;

-- Lectura pública.
drop policy if exists "cdqr_public_select_configuracion" on public.configuracion;
create policy "cdqr_public_select_configuracion"
  on public.configuracion
  for select
  to anon
  using (true);

drop policy if exists "cdqr_public_select_familias" on public.familias;
create policy "cdqr_public_select_familias"
  on public.familias
  for select
  to anon
  using (activo = true);

drop policy if exists "cdqr_public_select_productos" on public.productos;
create policy "cdqr_public_select_productos"
  on public.productos
  for select
  to anon
  using (activo = true);

drop policy if exists "cdqr_public_select_alergenos" on public.alergenos;
create policy "cdqr_public_select_alergenos"
  on public.alergenos
  for select
  to anon
  using (true);

drop policy if exists "cdqr_public_select_producto_alergeno" on public.producto_alergeno;
create policy "cdqr_public_select_producto_alergeno"
  on public.producto_alergeno
  for select
  to anon
  using (true);

-- El panel privado requiere sesión autenticada.
-- En esta primera versión el único nivel de acceso privado es
-- "authenticated", coherente con el modelo actual del proyecto.
drop policy if exists "cdqr_authenticated_all_configuracion" on public.configuracion;
create policy "cdqr_authenticated_all_configuracion"
  on public.configuracion
  for all
  to authenticated
  using (true)
  with check (true);

drop policy if exists "cdqr_authenticated_all_familias" on public.familias;
create policy "cdqr_authenticated_all_familias"
  on public.familias
  for all
  to authenticated
  using (true)
  with check (true);

drop policy if exists "cdqr_authenticated_all_productos" on public.productos;
create policy "cdqr_authenticated_all_productos"
  on public.productos
  for all
  to authenticated
  using (true)
  with check (true);

drop policy if exists "cdqr_authenticated_all_alergenos" on public.alergenos;
create policy "cdqr_authenticated_all_alergenos"
  on public.alergenos
  for all
  to authenticated
  using (true)
  with check (true);

drop policy if exists "cdqr_authenticated_all_producto_alergeno" on public.producto_alergeno;
create policy "cdqr_authenticated_all_producto_alergeno"
  on public.producto_alergeno
  for all
  to authenticated
  using (true)
  with check (true);

commit;
