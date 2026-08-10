import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronRight, Utensils } from 'lucide-react';
import { api } from '../services/api';
import type { Familia } from '../types/database';

const visualSlots = [
  'from-orange-100 via-amber-50 to-stone-100',
  'from-rose-100 via-orange-50 to-stone-100',
  'from-emerald-100 via-lime-50 to-stone-100',
  'from-sky-100 via-cyan-50 to-stone-100',
];

export default function Familias() {
  const navigate = useNavigate();
  const [familias, setFamilias] = useState<Familia[]>([]);
  const [loading, setLoading] = useState(true);

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
  }, []);

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center" style={{ background: 'var(--app-bg)' }}>
        <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-full px-3 pb-5 pt-4" style={{ background: 'var(--app-bg)', color: 'var(--app-text)' }}>
      <div className="mb-4 px-1">
        <p className="text-[11px] font-bold uppercase tracking-[0.18em]" style={{ color: 'var(--app-muted)' }}>Carta</p>
        <h1 className="mt-0.5 text-2xl font-extrabold tracking-tight">Nuestras familias</h1>
      </div>

      <div className="space-y-3">
        {familias.map((familia, index) => (
          <button
            key={familia.id}
            type="button"
            onClick={() => navigate(`/familias/${familia.id}`)}
            className="group flex min-h-[104px] w-full overflow-hidden rounded-2xl border text-left shadow-sm transition-transform active:scale-[0.985]"
            style={{ background: 'var(--app-surface)', borderColor: 'var(--app-border)', boxShadow: 'var(--app-shadow)' }}
          >
            <div className={`relative w-[37%] shrink-0 bg-gradient-to-br ${visualSlots[index % visualSlots.length]}`}>
              <div className="absolute inset-0 opacity-20" style={{ background: 'var(--app-image-overlay)' }} />
              <div className="flex h-full min-h-[104px] items-center justify-center text-stone-700/35 theme-night:text-white/20">
                <Utensils className="h-10 w-10" strokeWidth={1.35} />
              </div>
            </div>

            <div className="flex min-w-0 flex-1 items-center justify-between gap-3 px-4 py-3">
              <div className="min-w-0">
                <h2 className="truncate text-lg font-extrabold leading-tight">{familia.nombre}</h2>
                {familia.descripcion && (
                  <p className="mt-1 line-clamp-2 text-xs leading-4" style={{ color: 'var(--app-muted)' }}>{familia.descripcion}</p>
                )}
              </div>
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border" style={{ borderColor: 'var(--app-border)', color: 'var(--app-muted)' }}>
                <ChevronRight className="h-5 w-5" />
              </span>
            </div>
          </button>
        ))}
      </div>

      {familias.length === 0 && (
        <p className="mt-12 text-center text-sm" style={{ color: 'var(--app-muted)' }}>
          No hay familias disponibles en este momento.
        </p>
      )}
    </div>
  );
}
