import { useEffect, useState } from 'react';
import { ArrowLeft, Check, Heart } from 'lucide-react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import type { Producto } from '../types/database';
import { useSelectionStore } from '../store/selectionStore';
import { clsx } from 'clsx';

export default function FichaPlato() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [producto, setProducto] = useState<Producto | null>(null);
  const [loading, setLoading] = useState(true);
  const { isSelected, addSelection, removeSelection } = useSelectionStore();

  useEffect(() => {
    async function loadData() {
      if (!id) return;
      try {
        setProducto(await api.getProductoById(id));
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-full flex items-center justify-center" style={{ background: 'var(--app-bg)' }}>
        <div className="h-8 w-8 rounded-full border-2 border-current border-t-transparent animate-spin opacity-50" />
      </div>
    );
  }

  if (!producto) {
    return (
      <main className="min-h-full flex flex-col items-center justify-center px-6 text-center" style={{ background: 'var(--app-bg)', color: 'var(--app-text)' }}>
        <p className="text-lg font-semibold">Producto no encontrado.</p>
        <button onClick={() => navigate(-1)} className="mt-5 rounded-xl px-5 py-3 font-semibold" style={{ background: 'var(--app-surface)', border: '1px solid var(--app-border)' }}>
          Volver
        </button>
      </main>
    );
  }

  const selected = isSelected(producto.id);

  const toggleSelection = () => {
    if (selected) removeSelection(producto.id);
    else addSelection(producto.id);
  };

  return (
    <main className="min-h-full pb-28" style={{ background: 'var(--app-bg)', color: 'var(--app-text)' }}>
      <section className="relative w-full overflow-hidden" style={{ background: 'var(--app-surface)' }}>
        <div className="aspect-[4/3] w-full">
          {producto.foto_url ? (
            <img src={producto.foto_url} alt={producto.nombre} className="h-full w-full object-cover" />
          ) : (
            <div className="h-full w-full flex items-center justify-center text-sm" style={{ background: 'var(--app-surface-soft)', color: 'var(--app-muted)' }}>
              Sin imagen
            </div>
          )}
        </div>

        <button
          type="button"
          aria-label="Volver"
          onClick={() => navigate(-1)}
          className="absolute left-4 top-4 h-11 w-11 rounded-full flex items-center justify-center shadow-lg backdrop-blur-md"
          style={{ background: 'rgba(0,0,0,.58)', color: '#fff' }}
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
      </section>

      <section className="mx-4 -mt-5 relative rounded-3xl px-5 pt-5 pb-6 shadow-sm" style={{ background: 'var(--app-surface)', border: '1px solid var(--app-border)' }}>
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <h1 className="text-[27px] leading-tight font-extrabold tracking-tight">{producto.nombre}</h1>
          </div>
          <div className="shrink-0 rounded-2xl px-3 py-2 text-xl font-extrabold" style={{ background: 'var(--app-surface-soft)' }}>
            {producto.precio.toFixed(2)}€
          </div>
        </div>

        {producto.descripcion && (
          <p className="mt-5 text-[16px] leading-7" style={{ color: 'var(--app-muted)' }}>
            {producto.descripcion}
          </p>
        )}

        {producto.alergenos && producto.alergenos.length > 0 && (
          <div className="mt-6 pt-5" style={{ borderTop: '1px solid var(--app-border)' }}>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-extrabold uppercase tracking-wider">Alérgenos</h2>
              <span className="text-xs font-bold rounded-full px-2.5 py-1" style={{ background: 'var(--app-surface-soft)', color: 'var(--app-muted)' }}>
                {producto.alergenos.length}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              {producto.alergenos.map((alergeno) => (
                <div key={alergeno.id} className="min-h-14 rounded-2xl px-3 py-2 flex items-center gap-2.5" style={{ background: 'var(--app-surface-soft)', border: '1px solid var(--app-border)' }}>
                  {alergeno.icono ? (
                    <img src={alergeno.icono} alt="" className="h-8 w-8 object-contain shrink-0" />
                  ) : (
                    <span className="h-8 w-8 rounded-full shrink-0" style={{ background: 'var(--app-border)' }} />
                  )}
                  <span className="text-sm font-semibold leading-tight">{alergeno.nombre}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </section>

      <div className="fixed inset-x-0 bottom-0 z-30 p-3" style={{ background: 'linear-gradient(to top, var(--app-bg) 72%, transparent)' }}>
        <div className="mx-auto max-w-xl">
          <button
            type="button"
            onClick={toggleSelection}
            className={clsx(
              'w-full min-h-14 rounded-2xl flex items-center justify-center gap-2.5 px-5 font-extrabold text-[17px] shadow-xl active:scale-[.99] transition-transform',
              selected ? 'border-2' : 'border-0'
            )}
            style={selected
              ? { background: 'var(--app-surface)', color: 'var(--app-text)', borderColor: 'var(--app-text)' }
              : { background: 'var(--color-primary)', color: '#fff' }}
          >
            {selected ? <Check className="h-5 w-5" /> : <Heart className="h-5 w-5" />}
            {selected ? 'En mi selección' : 'Añadir a mi selección'}
          </button>
        </div>
      </div>
    </main>
  );
}
