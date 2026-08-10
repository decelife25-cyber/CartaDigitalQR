import { useEffect, useMemo, useRef, useState, type PointerEvent } from 'react';
import { ArrowLeft, ChevronDown, GripVertical, ImageOff, Plus, Search, X } from 'lucide-react';
import { Link } from 'react-router-dom';
import { adminApi } from '../../services/adminApi';
import type { Familia, Producto } from '../../types/database';

function errorMessage(error: unknown): string {
  if (error && typeof error === 'object' && 'message' in error) {
    return String((error as { message: unknown }).message);
  }
  return String(error);
}

type StatusFilter = 'todos' | 'activos' | 'ocultos' | 'disponibles' | 'agotados' | 'destacados';
type SortMode = 'orden' | 'nombre' | 'precio-asc' | 'precio-desc';

export default function AdminProductos() {
  const [productos, setProductos] = useState<Producto[]>([]);
  const [familias, setFamilias] = useState<Familia[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [familiaId, setFamiliaId] = useState('todas');
  const [status, setStatus] = useState<StatusFilter>('todos');
  const [sort, setSort] = useState<SortMode>('orden');
  const [savingOrder, setSavingOrder] = useState(false);
  const [draggedId, setDraggedId] = useState<string | null>(null);
  const productosRef = useRef<Producto[]>([]);
  const lastTargetRef = useRef<string | null>(null);
  const dragIdRef = useRef<string | null>(null);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [productosData, familiasData] = await Promise.all([
        adminApi.getProductosAdmin(),
        adminApi.getFamiliasAdmin(),
      ]);
      setProductos(productosData);
      setFamilias(familiasData);
    } catch (err) {
      console.error('Error loading productos:', err);
      setError(errorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { void fetchData(); }, []);
  useEffect(() => { productosRef.current = productos; }, [productos]);

  const familiaMap = useMemo(
    () => new Map(familias.map((familia) => [familia.id, familia.nombre])),
    [familias],
  );

  const filteredProductos = useMemo(() => {
    const query = search.trim().toLocaleLowerCase();
    const result = productos.filter((producto) => {
      const familia = familiaMap.get(producto.familia_id) ?? '';
      const matchesSearch = !query || `${producto.nombre} ${familia}`.toLocaleLowerCase().includes(query);
      const matchesFamily = familiaId === 'todas' || producto.familia_id === familiaId;
      const matchesStatus =
        status === 'todos' ||
        (status === 'activos' && producto.activo) ||
        (status === 'ocultos' && !producto.activo) ||
        (status === 'disponibles' && !producto.agotado) ||
        (status === 'agotados' && producto.agotado) ||
        (status === 'destacados' && producto.destacado);
      return matchesSearch && matchesFamily && matchesStatus;
    });

    return [...result].sort((a, b) => {
      if (sort === 'nombre') return a.nombre.localeCompare(b.nombre, 'es');
      if (sort === 'precio-asc') return a.precio - b.precio;
      if (sort === 'precio-desc') return b.precio - a.precio;
      return a.orden - b.orden;
    });
  }, [productos, familiaMap, search, familiaId, status, sort]);

  const canReorder = !search.trim() && familiaId === 'todas' && status === 'todos' && sort === 'orden' && !savingOrder;

  const clearFilters = () => {
    setSearch('');
    setFamiliaId('todas');
    setStatus('todos');
    setSort('orden');
  };

  const reorderLocal = (sourceId: string, targetId: string) => {
    if (sourceId === targetId) return;
    setProductos((current) => {
      const ordered = [...current].sort((a, b) => a.orden - b.orden);
      const sourceIndex = ordered.findIndex((item) => item.id === sourceId);
      const targetIndex = ordered.findIndex((item) => item.id === targetId);
      if (sourceIndex < 0 || targetIndex < 0) return current;

      const [moved] = ordered.splice(sourceIndex, 1);
      ordered.splice(targetIndex, 0, moved);
      return ordered.map((item, index) => ({ ...item, orden: index }));
    });
  };

  const startDrag = (event: PointerEvent<HTMLButtonElement>, id: string) => {
    if (!canReorder) return;
    event.preventDefault();
    event.currentTarget.setPointerCapture(event.pointerId);
    dragIdRef.current = id;
    lastTargetRef.current = id;
    setDraggedId(id);
  };

  const moveDrag = (event: PointerEvent<HTMLButtonElement>) => {
    const sourceId = dragIdRef.current;
    if (!sourceId || !canReorder) return;

    const targetElement = document
      .elementFromPoint(event.clientX, event.clientY)
      ?.closest<HTMLElement>('[data-product-id]');
    const targetId = targetElement?.dataset.productId;
    if (!targetId || targetId === sourceId || targetId === lastTargetRef.current) return;

    lastTargetRef.current = targetId;
    reorderLocal(sourceId, targetId);
  };

  const finishDrag = async (event: PointerEvent<HTMLButtonElement>) => {
    const sourceId = dragIdRef.current;
    if (!sourceId) return;

    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
    dragIdRef.current = null;
    lastTargetRef.current = null;
    setDraggedId(null);

    const ordered = [...productosRef.current].sort((a, b) => a.orden - b.orden);
    if (!ordered.length) return;

    setSavingOrder(true);
    try {
      await Promise.all(
        ordered.map((producto, index) => adminApi.updateProductoFields(producto.id, { orden: index })),
      );
    } catch (err) {
      setError(errorMessage(err));
      await fetchData();
    } finally {
      setSavingOrder(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center" style={{ background: 'var(--app-bg)' }}>
        <div className="h-7 w-7 animate-spin rounded-full border-b-2 border-orange-500" />
      </div>
    );
  }

  return (
    <div className="w-full min-h-[calc(100dvh-4rem)]" style={{ color: 'var(--app-text)' }}>
      <header className="flex items-center gap-1 border-b pb-2" style={{ borderColor: 'var(--app-border)' }}>
        <Link
          to="/admin"
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl"
          aria-label="Volver al panel privado"
        >
          <ArrowLeft size={21} />
        </Link>
        <div className="min-w-0 flex-1">
          <h1 className="text-[22px] font-extrabold tracking-tight sm:text-3xl">Productos</h1>
        </div>
        <Link
          to="/admin/productos/nuevo"
          className="inline-flex h-9 shrink-0 items-center gap-1 rounded-xl bg-orange-500 px-2.5 text-sm font-extrabold text-white"
        >
          <Plus size={17} />
          <span>Nuevo producto</span>
        </Link>
      </header>

      {error && (
        <div
          className="mt-2 flex items-center justify-between gap-2 rounded-xl border px-3 py-2 text-sm"
          style={{ borderColor: 'rgba(239,68,68,.25)', background: 'var(--app-surface)', color: '#dc2626' }}
        >
          <span className="min-w-0 break-words">{error}</span>
          <button type="button" onClick={() => void fetchData()} className="shrink-0 font-bold text-orange-600">
            Reintentar
          </button>
        </div>
      )}

      <div className="py-2">
        <div className="relative">
          <Search size={18} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--app-muted)' }} />
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Buscar artículos..."
            className="h-10 w-full rounded-xl border bg-transparent pl-10 pr-10 text-[14px] outline-none focus:border-orange-500"
            style={{ borderColor: 'var(--app-border)', color: 'var(--app-text)' }}
            aria-label="Buscar artículos"
          />
          {search && (
            <button
              type="button"
              onClick={() => setSearch('')}
              className="absolute right-2 top-1/2 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-lg"
              style={{ color: 'var(--app-muted)' }}
              aria-label="Limpiar búsqueda"
            >
              <X size={16} />
            </button>
          )}
        </div>

        <div className="mt-2 grid grid-cols-3 gap-2">
          <label className="relative min-w-0">
            <select
              value={familiaId}
              onChange={(event) => setFamiliaId(event.target.value)}
              className="h-9 w-full appearance-none truncate rounded-xl border bg-transparent px-2.5 pr-7 text-[12px] font-semibold outline-none"
              style={{ borderColor: 'var(--app-border)', color: 'var(--app-text)' }}
              aria-label="Filtrar por familia"
            >
              <option value="todas">Familia: Todas</option>
              {familias.filter((familia) => familia.activo).map((familia) => (
                <option key={familia.id} value={familia.id}>{familia.nombre}</option>
              ))}
            </select>
            <ChevronDown size={14} className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2" style={{ color: 'var(--app-muted)' }} />
          </label>

          <label className="relative min-w-0">
            <select
              value={status}
              onChange={(event) => setStatus(event.target.value as StatusFilter)}
              className="h-9 w-full appearance-none truncate rounded-xl border bg-transparent px-2.5 pr-7 text-[12px] font-semibold outline-none"
              style={{ borderColor: 'var(--app-border)', color: 'var(--app-text)' }}
              aria-label="Filtrar por estado"
            >
              <option value="todos">Estado: Todos</option>
              <option value="activos">Activos</option>
              <option value="ocultos">Ocultos</option>
              <option value="disponibles">Disponibles</option>
              <option value="agotados">Agotados</option>
              <option value="destacados">Destacados</option>
            </select>
            <ChevronDown size={14} className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2" style={{ color: 'var(--app-muted)' }} />
          </label>

          <label className="relative min-w-0">
            <select
              value={sort}
              onChange={(event) => setSort(event.target.value as SortMode)}
              className="h-9 w-full appearance-none truncate rounded-xl border bg-transparent px-2.5 pr-7 text-[12px] font-semibold outline-none"
              style={{ borderColor: 'var(--app-border)', color: 'var(--app-text)' }}
              aria-label="Ordenar productos"
            >
              <option value="orden">Orden: Carta</option>
              <option value="nombre">Nombre A-Z</option>
              <option value="precio-asc">Precio ↑</option>
              <option value="precio-desc">Precio ↓</option>
            </select>
            <ChevronDown size={14} className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2" style={{ color: 'var(--app-muted)' }} />
          </label>
        </div>

        {(search || familiaId !== 'todas' || status !== 'todos' || sort !== 'orden') && (
          <div className="mt-1 flex items-center justify-between px-1 text-[12px]" style={{ color: 'var(--app-muted)' }}>
            <span>{filteredProductos.length} resultados</span>
            <button type="button" onClick={clearFilters} className="font-bold text-orange-500">Limpiar</button>
          </div>
        )}
      </div>

      <section className="space-y-1.5" aria-label="Listado de productos">
        {filteredProductos.map((producto) => {
          const dragging = draggedId === producto.id;
          return (
            <article
              key={producto.id}
              data-product-id={producto.id}
              className={`grid grid-cols-[minmax(0,1fr)_32px] items-stretch overflow-hidden rounded-2xl border transition-opacity ${dragging ? 'opacity-45' : 'opacity-100'}`}
              style={{ background: 'var(--app-surface)', borderColor: 'var(--app-border)', boxShadow: 'var(--app-shadow)' }}
            >
              <Link
                to={`/admin/productos/${producto.id}/editar`}
                className="grid min-w-0 grid-cols-[42px_minmax(0,1fr)_72px] items-center gap-2 py-1.5 pl-2.5 sm:grid-cols-[48px_minmax(0,1fr)_92px_72px]"
                aria-label={`Editar ${producto.nombre}`}
              >
                {producto.foto_url ? (
                  <img
                    src={producto.foto_url}
                    alt=""
                    className="h-10 w-10 rounded-lg object-cover sm:h-11 sm:w-11"
                  />
                ) : (
                  <div
                    className="flex h-10 w-10 items-center justify-center rounded-lg sm:h-11 sm:w-11"
                    style={{ background: 'rgba(148,163,184,.12)', color: 'var(--app-muted)' }}
                    aria-hidden="true"
                  >
                    <ImageOff size={17} />
                  </div>
                )}

                <div className="min-w-0">
                  <div className="truncate text-[15px] font-extrabold leading-tight">{producto.nombre}</div>
                  <div className="mt-0.5 truncate text-[12px] font-medium" style={{ color: 'var(--app-muted)' }}>
                    {familiaMap.get(producto.familia_id) ?? 'Sin familia'}
                  </div>
                </div>

                <div className="min-w-0 text-right">
                  <div className="truncate text-[14px] font-extrabold">{producto.precio.toFixed(2)} €</div>
                  <span
                    className="mt-0.5 inline-flex max-w-full items-center rounded-full px-2 py-0.5 text-[10px] font-extrabold"
                    style={producto.activo
                      ? { background: 'rgba(16,185,129,.12)', color: '#10b981' }
                      : { background: 'rgba(148,163,184,.14)', color: 'var(--app-muted)' }}
                  >
                    {producto.activo ? 'Activo' : 'Oculto'}
                  </span>
                </div>

                <div className="hidden text-right sm:block">
                  <span
                    className="inline-flex rounded-full px-2 py-1 text-[10px] font-bold"
                    style={producto.agotado
                      ? { background: 'rgba(249,115,22,.12)', color: '#f97316' }
                      : { background: 'rgba(59,130,246,.12)', color: '#3b82f6' }}
                  >
                    {producto.agotado ? 'Agotado' : 'Disponible'}
                  </span>
                </div>
              </Link>

              <button
                type="button"
                disabled={!canReorder}
                onPointerDown={(event) => startDrag(event, producto.id)}
                onPointerMove={moveDrag}
                onPointerUp={(event) => void finishDrag(event)}
                onPointerCancel={(event) => void finishDrag(event)}
                className="flex min-h-[58px] w-8 touch-none items-center justify-center disabled:cursor-default disabled:opacity-70"
                style={{ color: 'var(--app-muted)' }}
                aria-label={`Arrastrar ${producto.nombre} para cambiar su orden`}
                title={canReorder ? 'Arrastra para cambiar el orden' : 'Restablece los filtros para cambiar el orden'}
              >
                <GripVertical size={18} />
              </button>
            </article>
          );
        })}

        {!filteredProductos.length && (
          <div
            className="rounded-2xl border border-dashed px-5 py-10 text-center"
            style={{ background: 'var(--app-surface)', borderColor: 'var(--app-border)' }}
          >
            <Search className="mx-auto" style={{ color: 'var(--app-muted)' }} size={30} />
            <h2 className="mt-2 font-bold">No hay productos</h2>
            <p className="mt-1 text-sm" style={{ color: 'var(--app-muted)' }}>Prueba otra búsqueda o limpia los filtros.</p>
            {(search || familiaId !== 'todas' || status !== 'todos' || sort !== 'orden') && (
              <button type="button" onClick={clearFilters} className="mt-3 rounded-xl bg-orange-500 px-4 py-2 text-sm font-bold text-white">Limpiar filtros</button>
            )}
          </div>
        )}
      </section>
    </div>
  );
}
