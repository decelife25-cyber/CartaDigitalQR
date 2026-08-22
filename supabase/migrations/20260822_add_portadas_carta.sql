-- Biblioteca de portadas de la carta.
-- Mantiene hasta 10 portadas por restaurante y permite una portada
-- por defecto más portadas con activación automática por fechas.

begin;

create table if not exists public.portadas_carta (
  id uuid primary key default gen_random_uuid(),
  configuracion_id uuid not null references public.configuracion_restaurante(id) on delete cascade,
  nombre text not null,
  image_url text not null,
  storage_path text,
  activa boolean not null default false,
  programada_desde timestamptz,
  programada_hasta timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint portadas_carta_programacion_valida check (
    programada_hasta is null or programada_desde is null or programada_hasta > programada_desde
  )
);

create unique index if not exists portadas_carta_una_activa
  on public.portadas_carta(configuracion_id)
  where activa = true;

create index if not exists portadas_carta_configuracion_idx
  on public.portadas_carta(configuracion_id);

create or replace function public.portadas_carta_limite()
returns trigger
language plpgsql
as $$
declare
  total integer;
begin
  select count(*) into total
  from public.portadas_carta
  where configuracion_id = new.configuracion_id
    and (tg_op = 'INSERT' or id <> new.id);

  if total >= 10 then
    raise exception 'No puedes guardar más de 10 portadas para este restaurante.';
  end if;

  return new;
end;
$$;

drop trigger if exists portadas_carta_limite_trigger on public.portadas_carta;
create trigger portadas_carta_limite_trigger
before insert or update of configuracion_id on public.portadas_carta
for each row execute function public.portadas_carta_limite();

grant select on table public.portadas_carta to anon;
grant select, insert, update, delete on table public.portadas_carta to authenticated;

alter table public.portadas_carta enable row level security;

drop policy if exists "cdqr_public_select_portadas_carta" on public.portadas_carta;
create policy "cdqr_public_select_portadas_carta"
  on public.portadas_carta
  for select
  to anon
  using (true);

drop policy if exists "cdqr_authenticated_all_portadas_carta" on public.portadas_carta;
create policy "cdqr_authenticated_all_portadas_carta"
  on public.portadas_carta
  for all
  to authenticated
  using (true)
  with check (true);

-- Importa la portada que ya existe para que la instalación empiece con ella
-- dentro de la biblioteca sin volver a subir el archivo.
insert into public.portadas_carta (configuracion_id, nombre, image_url, activa)
select c.id, 'Portada actual', c.portada_url, true
from public.configuracion_restaurante c
where c.activo = true
  and c.portada_url is not null
  and not exists (
    select 1 from public.portadas_carta p where p.configuracion_id = c.id
  );

commit;
