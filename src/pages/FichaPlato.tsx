import { useEffect, useState } from 'react';
import { ArrowLeft, Check, Heart, Utensils } from 'lucide-react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import type { Producto } from '../types/database';
import { useSelectionStore } from '../store/selectionStore';
import { clsx } from 'clsx';

function AlergenoIcon({ icono, nombre }: { icono: string | null; nombre: string }) {
  const [failed, setFailed] = useState(false);

  if (!icono || failed) {
    return <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border" style={{ borderColor: 'var(--app-border)', color: 'var(--app-muted)' }}>•</span>;
  }

  return (
    <img
      src={icono}
      alt=""
      title={nombre}
      className="h-8 w-8 shrink-0 object-contain"
      onError={() => setFailed(true)}
    />
  );
}

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
    void loadData();
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
            <img
              src={producto.foto_url}
              alt={producto.nombre}
              className="h-full w-full object-cover"
              onError={(event) => {
                event.currentTarget.style.display = 'none';
                event.currentTarget.nextElementSibling?.removeAttribute('hidden');
              }}
            />
          ) : null}
          <div
            hidden={Boolean(producto.foto_url)}
            className="flex h-full w-full items-center justify-center"
            style={{ background: 'var(--app-surface-soft)', color: 'var(--app-muted)' }}
          >
            <div className="flex flex-col items-center gap-2">
              <Utensils className="h-10 w-10" strokeWidth={1.2} />
              <span className="text-sm">Sin imagen</span>
            </div>
          </div>
        </div>

        <button
          type="button"
          aria-label="Volver"
          onClick={() => navigate(-1)}
          className="absolute left-4 top-4 flex h-11 w-11 items-center justify-center rounded-full shadow-lg backdrop-blur-md"
          style={{ background: 'rgba(0,0,0,.58)', color: '#fff' }}
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
      </section>

      <section className="relative mx-3 -mt-5 rounded-3xl px-5 pb-7 pt-5 shadow-sm" style={{ background: 'var(--app-surface)', border: '1px solid var(--app-border)' }}>
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <h1 className="text-[27px] leading-[1.08] font-extrabold tracking-tight">{producto.nombre}</h1>
          </div>
          <div className="shrink-0 rounded-2xl px-3 py-2 text-xl font-extrabold" style={{ background: 'var(--app-surface-soft)', color: 'var(--app-text)' }}>
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
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-sm font-extrabold uppercase tracking-wider">Alérgenos</h2>
              <span className="rounded-full px-2.5 py-1 text-xs font-bold" style={{ background: 'var(--app-surface-soft)', color: 'var(--app-muted)' }}>
                {producto.alergenos.length}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              {producto.alergenos.map((alergeno) => (
                <div key={alergeno.id} className="flex min-h-14 items-center gap-2.5 rounded-2xl px-3 py-2" style={{ background: 'var(--app-surface-soft)', border: '1px solid var(--app-border)' }}>
                  <AlergenoIcon icono={alergeno.icono} nombre={alergeno.nombre} />
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
              'flex min-h-14 w-full items-center justify-center gap-2.5 rounded-2xl px-5 text-[17px] font-extrabold shadow-xl transition-transform active:scale-[.99]',
              selected ? 'border-2' : 'border-0'
            )}
            style={selected
              ? { background: 'var(--app-surface)', color: 'var(--app-text)', borderColor: 'var(--app-text)' }
              : { background: '#18181b', color: '#fff' }}
          >
            {selected ? <Check className="h-5 w-5" /> : <Heart className="h-5 w-5" />}
            {selected ? 'En mi selección' : 'Añadir a mi selección'}
          </button>
        </div>
      </div>
    </main>
  );
}
