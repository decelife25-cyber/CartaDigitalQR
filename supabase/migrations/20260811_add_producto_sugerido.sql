-- Marca temporal de producto sugerido para la carta.
-- Es independiente de destacado: un producto puede tener ambas marcas.
alter table public.productos
  add column if not exists sugerido boolean not null default false;

create index if not exists productos_sugerido_idx
  on public.productos (sugerido)
  where sugerido = true;
