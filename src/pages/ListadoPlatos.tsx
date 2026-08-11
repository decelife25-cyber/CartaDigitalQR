import { useEffect, useState } from 'react';
import { ArrowLeft, ChevronRight, Moon, Sun, Utensils } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import { api } from '../services/api';
import type { Familia, Producto } from '../types/database';

function toggleTheme() {
  const root = document.documentElement;
  const night = !root.classList.contains('theme-night');
  root.classList.toggle('theme-night', night);
  window.localStorage.setItem('carta-theme', night ? 'night' : 'day');
  window.dispatchEvent(new CustomEvent('carta-theme-change'));
}

const ALERGENO_BG: Record<string, string> = {
  gluten: '#f3d9df',
  cereal: '#f3d9df',
  crustaceo: '#dbe9fb',
  crustaceos: '#dbe9fb',
  huevo: '#fff0b8',
  huevos: '#fff0b8',
  pescado: '#d5edf7',
  cacahuete: '#ead9c9',
  cacahuetes: '#ead9c9',
  soja: '#d9ebc9',
  leche: '#dce3ec',
  lacteos: '#dce3ec',
  lacteo: '#dce3ec',
  'frutos de cascara': '#ead9c9',
  apio: '#d9ebc9',
  mostaza: '#ffe9a8',
  sesamo: '#e9e0cf',
  sulfitos: '#ead9ea',
  sulfito: '#ead9ea',
  altramuces: '#e5d9f0',
  altramuz: '#e5d9f0',
  moluscos: '#dbe6f5',
  molusco: '#dbe6f5',
};

function normalize(value: string): string {
  return value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
}

function allergenBackground(nombre: string): string {
  const key = normalize(nombre);
  for (const [name, background] of Object.entries(ALERGENO_BG)) {
    if (key.includes(name)) return background;
  }
  return 'var(--app-surface-soft)';
}

function AlergenoItem({ producto }: { producto: Producto }) {
  if (!producto.alergenos?.length) return null;

  return (
    <div
      className="flex w-full flex-wrap items-center justify-start gap-1"
      aria-label="Alérgenos"
    >
      {producto.alergenos.map((alergeno) => (
        <span
          key={alergeno.id}
          title={alergeno.nombre}
          className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full"
          style={{ background: allergenBackground(alergeno.nombre) }}
        >
          {alergeno.icono ? (
            <img
              src={alergeno.icono}
              alt={alergeno.nombre}
              className="h-5 w-5 object-contain"
              onError={(event) => {
                event.currentTarget.style.display = 'none';
              }}
            />
          ) : (
            <span className="text-[9px] font-extrabold" style={{ color: 'var(--app-text)' }}>
              {alergeno.sigla || '•'}
            </span>
          )}
        </span>
      ))}
    </div>
  );
}

function ProductoImagen({ producto }: { producto: Producto }) {
  const [error, setError] = useState(false);

  if (!producto.foto_url || error) {
    return (
      <div
        className="flex h-full w-full items-center justify-center"
        style={{ background: 'var(--app-surface-soft)', color: 'var(--app-muted)' }}
      >
        <Utensils className="h-8 w-8" strokeWidth={1.2} />
      </div>
    );
  }

  return (
    <img
      src={producto.foto_url}
      alt={producto.nombre}
      loading="lazy"
      className="h-full w-full object-cover"
      onError={() => setError(true)}
    />
  );
}

export default function ListadoPlatos() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [productos, setProductos] = useState<Producto[]>([]);
  const [familia, setFamilia] = useState<Familia | null>(null);
  const [night, setNight] = useState(() => document.documentElement.classList.contains('theme-night'));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      if (!id) return;
      try {
        const [productosData, familiasData] = await Promise.all([
          api.getProductosByFamilia(id),
          api.getFamilias(),
        ]);

        setProductos(productosData);
        const currentFamilia = familiasData.find((f) => f.id === id);
        if (currentFamilia) setFamilia(currentFamilia);
      } finally {
        setLoading(false);
      }
    }
    void loadData();

    const syncTheme = () => setNight(document.documentElement.classList.contains('theme-night'));
    window.addEventListener('carta-theme-change', syncTheme);
    return () => window.removeEventListener('carta-theme-change', syncTheme);
  }, [id]);

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center" style={{ background: 'var(--app-bg)' }}>
        <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-primary" />
      </div>
    );
  }

  const familyName = familia?.nombre || 'Platos';

  return (
    <main className="min-h-[100dvh] w-full" style={{ background: 'var(--app-bg)', color: 'var(--app-text)' }}>
      <header
        className="sticky top-0 z-20 flex h-16 items-center border-b px-3"
        style={{ background: 'var(--app-surface)', borderColor: 'var(--app-border)' }}
      >
        <button
          type="button"
          onClick={() => navigate('/familias')}
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full"
          aria-label="Volver a familias"
        >
          <ArrowLeft className="h-6 w-6" />
        </button>

        <div className="min-w-0 flex-1 px-2">
          <p className="text-[9px] font-extrabold uppercase tracking-[0.18em]" style={{ color: 'var(--app-muted)' }}>
            Familia
          </p>
          <h1 className="truncate text-[21px] font-extrabold leading-tight tracking-tight">{familyName}</h1>
        </div>

        <button
          type="button"
          onClick={toggleTheme}
          aria-label={night ? 'Cambiar a modo día' : 'Cambiar a modo noche'}
          title={night ? 'Modo día' : 'Modo noche'}
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border transition-transform active:scale-95"
          style={{ background: 'var(--app-surface)', borderColor: 'var(--app-border)', color: 'var(--app-text)' }}
        >
          {night ? <Sun size={20} strokeWidth={2.2} /> : <Moon size={20} strokeWidth={2.2} />}
        </button>
      </header>

      <section aria-label={`Productos de ${familyName}`} className="px-3 pb-5 pt-3">
        <div className="space-y-2.5">
          {productos.map((producto) => (
            <button
              key={producto.id}
              type="button"
              onClick={() => navigate(`/plato/${producto.id}`)}
              className="relative flex h-[124px] w-full overflow-hidden rounded-2xl border text-left shadow-sm transition-transform active:scale-[0.985]"
              style={{ background: 'var(--app-surface)', borderColor: 'var(--app-border)', boxShadow: 'var(--app-shadow)' }}
            >
              {/* Foto: zona izquierda fija. Los alérgenos NUNCA se colocan aquí. */}
              <div className="relative h-full w-[30%] shrink-0 overflow-hidden bg-stone-100">
                <ProductoImagen producto={producto} />
              </div>

              {/*
                Zona derecha completamente separada en tres áreas:
                1. Nombre arriba a la izquierda.
                2. Precio arriba a la derecha.
                3. Alérgenos abajo, siempre debajo del nombre.
                Así ningún elemento puede superponerse.
              */}
              <div className="relative h-full min-w-0 flex-1">
                <h2 className="absolute left-3.5 right-20 top-3 min-w-0 overflow-hidden text-[16px] font-extrabold leading-[1.08] [display:-webkit-box] [-webkit-box-orient:vertical] [-webkit-line-clamp:2]">
                  {producto.nombre}
                </h2>

                <span
                  className="absolute right-12 top-3 whitespace-nowrap text-[16px] font-extrabold leading-none text-primary"
                  aria-label={`Precio ${producto.precio.toFixed(2)} euros`}
                >
                  {producto.precio.toFixed(2)}€
                </span>

                <div className="absolute bottom-3 left-3.5 right-12 overflow-hidden">
                  <AlergenoItem producto={producto} />
                </div>
              </div>

              <span
                className="absolute bottom-3 right-3 flex h-8 w-8 items-center justify-center rounded-full border"
                style={{ borderColor: 'var(--app-border)', color: 'var(--app-muted)', background: 'var(--app-surface)' }}
              >
                <ChevronRight className="h-5 w-5" />
              </span>
            </button>
          ))}
        </div>

        {productos.length === 0 && (
          <p className="mt-12 text-center text-sm" style={{ color: 'var(--app-muted)' }}>
            No hay productos disponibles en esta categoría.
          </p>
        )}
      </section>
    </main>
  );
}
