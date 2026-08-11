import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronRight, Moon, Sun, Utensils } from 'lucide-react';
import { api } from '../services/api';
import type { Familia } from '../types/database';

const visualSlots = [
  'from-orange-100 via-amber-50 to-stone-100',
  'from-rose-100 via-orange-50 to-stone-100',
  'from-emerald-100 via-lime-50 to-stone-100',
  'from-sky-100 via-cyan-50 to-stone-100',
];

function toggleTheme() {
  const root = document.documentElement;
  const night = !root.classList.contains('theme-night');
  root.classList.toggle('theme-night', night);
  window.localStorage.setItem('carta-theme', night ? 'night' : 'day');
  window.dispatchEvent(new CustomEvent('carta-theme-change'));
}

export default function Familias() {
  const navigate = useNavigate();
  const [familias, setFamilias] = useState<Familia[]>([]);
  const [loading, setLoading] = useState(true);
  const [night, setNight] = useState(() => document.documentElement.classList.contains('theme-night'));

  useEffect(() => {
    async function loadFamilias() {
      try {
        const data = await api.getFamilias();
        setFamilias(data);
      } finally {
        setLoading(false);
      }
    }
    void loadFamilias();

    const syncTheme = () => setNight(document.documentElement.classList.contains('theme-night'));
    window.addEventListener('carta-theme-change', syncTheme);
    return () => window.removeEventListener('carta-theme-change', syncTheme);
  }, []);

  if (loading) {
    return (
      <div className="flex min-h-[100dvh] items-center justify-center" style={{ background: 'var(--app-bg)' }}>
        <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-primary" />
      </div>
    );
  }

  return (
    <main className="min-h-[100dvh] w-full px-3 pb-6 pt-4 sm:px-5" style={{ background: 'var(--app-bg)', color: 'var(--app-text)' }}>
      <div className="mx-auto w-full max-w-2xl">
        <header className="mb-5 flex items-start justify-between gap-3 px-1">
          <div className="min-w-0">
            <p className="text-[11px] font-bold uppercase tracking-[0.2em]" style={{ color: 'var(--app-muted)' }}>
              Carta
            </p>
            <h1 className="mt-1 text-[28px] font-extrabold leading-none tracking-[-0.03em]">
              Nuestras familias
            </h1>
          </div>

          <button
            type="button"
            onClick={toggleTheme}
            aria-label={night ? 'Cambiar a modo día' : 'Cambiar a modo noche'}
            title={night ? 'Modo día' : 'Modo noche'}
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border shadow-sm transition-transform active:scale-95"
            style={{ background: 'var(--app-surface)', borderColor: 'var(--app-border)', color: 'var(--app-text)', boxShadow: 'var(--app-shadow)' }}
          >
            {night ? <Sun size={20} strokeWidth={2.2} /> : <Moon size={20} strokeWidth={2.2} />}
          </button>
        </header>

        <section className="space-y-3" aria-label="Familias de la carta">
          {familias.map((familia, index) => (
            <button
              key={familia.id}
              type="button"
              onClick={() => navigate(`/familias/${familia.id}`)}
              className="group flex min-h-[112px] w-full overflow-hidden rounded-[22px] border text-left shadow-sm transition-transform active:scale-[0.985]"
              style={{
                background: 'var(--app-surface)',
                borderColor: 'var(--app-border)',
                boxShadow: 'var(--app-shadow)',
              }}
            >
              <div className={`relative w-[38%] shrink-0 bg-gradient-to-br ${visualSlots[index % visualSlots.length]}`}>
                <div className="absolute inset-0" style={{ background: 'var(--app-image-overlay)' }} />
                <div className="flex h-full min-h-[112px] items-center justify-center">
                  <Utensils
                    className="h-11 w-11"
                    strokeWidth={1.15}
                    style={{ color: 'var(--app-muted)', opacity: 0.42 }}
                  />
                </div>
              </div>

              <div className="flex min-w-0 flex-1 items-center justify-between gap-3 px-4 py-3.5">
                <div className="min-w-0">
                  <h2 className="text-[18px] font-extrabold leading-tight tracking-[-0.015em]">
                    {familia.nombre}
                  </h2>
                  {familia.descripcion && (
                    <p className="mt-1 line-clamp-2 text-[12px] leading-4" style={{ color: 'var(--app-muted)' }}>
                      {familia.descripcion}
                    </p>
                  )}
                </div>

                <span
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border"
                  style={{ borderColor: 'var(--app-border)', color: 'var(--app-muted)', background: 'var(--app-surface-soft)' }}
                >
                  <ChevronRight className="h-5 w-5" strokeWidth={2} />
                </span>
              </div>
            </button>
          ))}
        </section>

        {familias.length === 0 && (
          <p className="mt-12 text-center text-sm" style={{ color: 'var(--app-muted)' }}>
            No hay familias disponibles en este momento.
          </p>
        )}
      </div>
    </main>
  );
}
