import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronRight, Moon, Sun, Utensils } from 'lucide-react';
import { api } from '../services/api';
import type { Familia } from '../types/database';

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
    <main className="min-h-[100dvh] w-full" style={{ background: 'var(--app-bg)', color: 'var(--app-text)' }}>
      <div className="mx-auto w-full max-w-2xl">
        <header
          className="sticky top-0 z-20 flex min-h-[74px] items-center justify-between border-b px-4"
          style={{ background: 'var(--app-surface)', borderColor: 'var(--app-border)' }}
        >
          <div className="min-w-0">
            <p className="text-[10px] font-extrabold uppercase tracking-[0.2em]" style={{ color: 'var(--app-muted)' }}>
              Carta
            </p>
            <h1 className="mt-0.5 text-[24px] font-extrabold leading-none tracking-tight">
              Familias
            </h1>
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

        <section aria-label="Familias de la carta">
          {familias.map((familia) => (
            <button
              key={familia.id}
              type="button"
              onClick={() => navigate(`/familias/${familia.id}`)}
              className="flex min-h-[72px] w-full items-center border-b text-left transition-colors active:brightness-95"
              style={{ background: 'var(--app-surface)', borderColor: 'var(--app-border)' }}
            >
              <div className="relative ml-3 h-[58px] w-[74px] shrink-0 overflow-hidden rounded-lg bg-stone-200">
                {familia.foto_url ? (
                  <img
                    src={familia.foto_url}
                    alt={`Foto de ${familia.nombre}`}
                    className="h-full w-full object-cover"
                    loading="lazy"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center" style={{ color: 'var(--app-muted)' }}>
                    <Utensils size={20} strokeWidth={1.6} />
                  </div>
                )}
                <div className="absolute inset-0 bg-black/5" />
              </div>

              <div className="flex min-w-0 flex-1 items-center justify-between gap-2 px-3 py-2">
                <div className="min-w-0">
                  <h2 className="text-[16px] font-extrabold leading-tight">
                    {familia.nombre}
                  </h2>
                  {familia.descripcion && (
                    <p className="mt-0.5 line-clamp-1 text-[11px] leading-4" style={{ color: 'var(--app-muted)' }}>
                      {familia.descripcion}
                    </p>
                  )}
                </div>

                <span
                  className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border"
                  style={{ borderColor: 'var(--app-border)', color: 'var(--app-muted)', background: 'var(--app-surface-soft)' }}
                >
                  <ChevronRight className="h-4 w-4" strokeWidth={2} />
                </span>
              </div>
            </button>
          ))}
        </section>

        {familias.length === 0 && (
          <div className="px-4 py-12 text-center" style={{ color: 'var(--app-muted)' }}>
            <Utensils className="mx-auto mb-3 h-8 w-8 opacity-50" strokeWidth={1.5} />
            <p className="text-sm">No hay familias disponibles en este momento.</p>
          </div>
        )}
      </div>
    </main>
  );
}
