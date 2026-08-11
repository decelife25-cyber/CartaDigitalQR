import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ChevronRight, Utensils } from 'lucide-react';
import { api } from '../services/api';
import type { Producto, Familia } from '../types/database';

function Alergenos({ producto }: { producto: Producto }) {
  if (!producto.alergenos?.length) return null;

  return (
    <div className="flex min-w-0 items-center gap-1.5" aria-label="Alérgenos">
      {producto.alergenos.slice(0, 5).map((alergeno) => (
        alergeno.icono ? (
          <img
            key={alergeno.id}
            src={alergeno.icono}
            alt=""
            title={alergeno.nombre}
            className="h-5 w-5 shrink-0 object-contain"
            onError={(event) => {
              event.currentTarget.style.display = 'none';
            }}
          />
        ) : (
          <span
            key={alergeno.id}
            title={alergeno.nombre}
            className="flex h-5 min-w-5 items-center justify-center rounded-full border px-1 text-[9px] font-bold"
            style={{ borderColor: 'var(--app-border)', color: 'var(--app-muted)' }}
          >
            {alergeno.sigla || '•'}
          </span>
        )
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
        <Utensils className="h-9 w-9" strokeWidth={1.25} />
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
  }, [id]);

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
        <p className="text-[11px] font-bold uppercase tracking-[0.18em]" style={{ color: 'var(--app-muted)' }}>Familia</p>
        <h1 className="mt-0.5 text-2xl font-extrabold tracking-tight">{familia?.nombre || 'Platos'}</h1>
      </div>

      <div className="space-y-3">
        {productos.map((producto) => (
          <button
            key={producto.id}
            type="button"
            onClick={() => navigate(`/plato/${producto.id}`)}
            className="flex min-h-[116px] w-full overflow-hidden rounded-2xl border text-left shadow-sm transition-transform active:scale-[0.985]"
            style={{ background: 'var(--app-surface)', borderColor: 'var(--app-border)', boxShadow: 'var(--app-shadow)' }}
          >
            <div className="relative h-[116px] w-[34%] shrink-0 overflow-hidden bg-stone-100">
              <ProductoImagen producto={producto} />
            </div>

            <div className="flex min-w-0 flex-1 items-center gap-2 px-3.5 py-3">
              <div className="flex min-w-0 flex-1 flex-col self-stretch">
                <div className="min-w-0">
                  <h2 className="line-clamp-2 text-[16px] font-extrabold leading-[1.12]">{producto.nombre}</h2>
                  {producto.descripcion && (
                    <p className="mt-1 line-clamp-2 text-xs leading-4" style={{ color: 'var(--app-muted)' }}>
                      {producto.descripcion}
                    </p>
                  )}
                </div>

                <div className="mt-auto flex items-end justify-between gap-2 pt-2">
                  <span className="text-lg font-extrabold leading-none text-primary">
                    {producto.precio.toFixed(2)}€
                  </span>
                  <Alergenos producto={producto} />
                </div>
              </div>

              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border" style={{ borderColor: 'var(--app-border)', color: 'var(--app-muted)' }}>
                <ChevronRight className="h-5 w-5" />
              </span>
            </div>
          </button>
        ))}
      </div>

      {productos.length === 0 && (
        <p className="mt-12 text-center text-sm" style={{ color: 'var(--app-muted)' }}>
          No hay productos disponibles en esta categoría.
        </p>
      )}
    </div>
  );
}
