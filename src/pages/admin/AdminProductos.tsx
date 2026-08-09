import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Check,
  ChevronDown,
  Edit,
  Eye,
  EyeOff,
  Filter,
  PackagePlus,
  Plus,
  Search,
  Star,
  Trash2,
  X,
} from 'lucide-react';
import { adminApi } from '../../services/adminApi';
import type { Familia, Producto } from '../../types/database';

function errorMessage(error: unknown): string {
  if (error && typeof error === 'object' && 'message' in error) {
    return String((error as { message: unknown }).message);
  }
  return String(error);
}

type StatusFilter = 'todos' | 'visibles' | 'ocultos' | 'disponibles' | 'agotados' | 'destacados';
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
  const [showFilters, setShowFilters] = useState(false);
  const [busyId, setBusyId] = useState<string | null>(null);

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

  useEffect(() => {
    void fetchData();
  }, []);

  const familiaMap = useMemo(() => new Map(familias.map((familia) => [familia.id, familia.nombre])), [familias]);

  const filteredProductos = useMemo(() => {
    const query = search.trim().toLocaleLowerCase();
    const result = productos.filter((producto) => {
      const matchesSearch = !query || [producto.nombre, producto.descripcion ?? '', familiaMap.get(producto.familia_id) ?? '']
        .join(' ')
        .toLocaleLowerCase()
        .includes(query);
      const matchesFamily = familiaId === 'todas' || producto.familia_id === familiaId;
      const matchesStatus =
        status === 'todos' ||
        (status === 'visibles' && producto.activo) ||
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
  }, [productos, familias, familiaMap, search, familiaId, status, sort]);

  const counts = useMemo(() => ({
    total: productos.length,
    visibles: productos.filter((p) => p.activo).length,
    agotados: productos.filter((p) => p.agotado).length,
    destacados: productos.filter((p) => p.destacado).length,
  }), [productos]);

  const hasFilters = Boolean(search || familiaId !== 'todas' || status !== 'todos' || sort !== 'orden');

  const clearFilters = () => {
    setSearch('');
    setFamiliaId('todas');
    setStatus('todos');
    setSort('orden');
  };

  const quickUpdate = async (producto: Producto, field: 'activo' | 'agotado' | 'destacado') => {
    setBusyId(producto.id);
    try {
      const next = !producto[field];
      await adminApi.updateProductoFields(producto.id, { [field]: next });
      setProductos((current) => current.map((p) => p.id === producto.id ? { ...p, [field]: next } : p));
    } catch (err) {
      alert(errorMessage(err));
    } finally {
      setBusyId(null);
    }
  };

  const handleDelete = async (producto: Producto) => {
    if (!window.confirm(`¿Eliminar "${producto.nombre}"? Esta acción no se puede deshacer.`)) return;
    setBusyId(producto.id);
    try {
      await adminApi.deleteProducto(producto.id);
      setProductos((current) => current.filter((p) => p.id !== producto.id));
    } catch (err) {
      alert(errorMessage(err));
    } finally {
      setBusyId(null);
    }
  };

  if (loading) {
    return <div className="flex min-h-[40vh] items-center justify-center"><div className="h-8 w-8 animate-spin rounded-full border-b-2 border-[var(--color-primary)]" /></div>;
  }

  if (error) {
    return (
      <div className="mx-auto mt-8 max-w-2xl rounded-2xl border border-red-200 bg-red-50 p-6">
        <h1 className="text-xl font-bold text-red-800">No se pueden cargar los productos</h1>
        <p className="mt-2 break-words text-sm text-red-700">{error}</p>
        <button type="button" onClick={() => void fetchData()} className="mt-4 rounded-lg px-4 py-2 font-medium text-white" style={{ backgroundColor: 'var(--color-primary)' }}>Reintentar</button>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-5xl space-y-4">
      <header className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900">Productos</h1>
          <p className="mt-1 text-sm text-gray-500">{counts.total} productos · {counts.visibles} visibles · {counts.agotados} agotados</p>
        </div>
        <Link to="/admin/productos/nuevo" className="inline-flex h-11 items-center justify-center gap-2 rounded-xl px-4 font-semibold text-white shadow-sm" style={{ backgroundColor: 'var(--color-primary)' }}>
          <Plus size={19} /> Nuevo producto
        </Link>
      </header>

      <section className="rounded-2xl border border-gray-200 bg-white p-3 shadow-sm sm:p-4">
        <div className="flex flex-col gap-3 lg:flex-row">
          <label className="relative min-w-0 flex-1">
            <Search size={19} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar producto, descripción o familia..."
              className="h-11 w-full rounded-xl border border-gray-200 bg-gray-50 pl-10 pr-10 text-sm outline-none transition focus:border-[var(--color-primary)] focus:bg-white"
            />
            {search && <button type="button" onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"><X size={18} /></button>}
          </label>

          <div className="flex gap-2">
            <button type="button" onClick={() => setShowFilters((value) => !value)} className={`inline-flex h-11 flex-1 items-center justify-center gap-2 rounded-xl border px-4 text-sm font-semibold sm:flex-none ${showFilters || hasFilters ? 'border-[var(--color-primary)] bg-gray-50 text-gray-900' : 'border-gray-200 text-gray-600'}`}>
              <Filter size={18} /> Filtros {hasFilters && <span className="rounded-full bg-gray-900 px-1.5 py-0.5 text-[10px] text-white">!</span>}
            </button>
            <button type="button" onClick={() => void fetchData()} className="inline-flex h-11 w-11 items-center justify-center rounded-xl border border-gray-200 text-gray-600" aria-label="Actualizar"><PackagePlus size={18} /></button>
          </div>
        </div>

        {showFilters && (
          <div className="mt-3 grid gap-3 border-t border-gray-100 pt-3 sm:grid-cols-3">
            <label className="space-y-1.5">
              <span className="text-xs font-semibold uppercase tracking-wide text-gray-500">Familia</span>
              <div className="relative">
                <select value={familiaId} onChange={(e) => setFamiliaId(e.target.value)} className="h-11 w-full appearance-none rounded-xl border border-gray-200 bg-white px-3 pr-9 text-sm outline-none">
                  <option value="todas">Todas las familias</option>
                  {familias.filter((f) => f.activo).map((familia) => <option key={familia.id} value={familia.id}>{familia.nombre}</option>)}
                </select>
                <ChevronDown size={17} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" />
              </div>
            </label>
            <label className="space-y-1.5">
              <span className="text-xs font-semibold uppercase tracking-wide text-gray-500">Estado</span>
              <div className="relative">
                <select value={status} onChange={(e) => setStatus(e.target.value as StatusFilter)} className="h-11 w-full appearance-none rounded-xl border border-gray-200 bg-white px-3 pr-9 text-sm outline-none">
                  <option value="todos">Todos</option><option value="visibles">Visibles</option><option value="ocultos">Ocultos</option><option value="disponibles">Disponibles</option><option value="agotados">Agotados</option><option value="destacados">Destacados</option>
                </select>
                <ChevronDown size={17} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" />
              </div>
            </label>
            <label className="space-y-1.5">
              <span className="text-xs font-semibold uppercase tracking-wide text-gray-500">Ordenar</span>
              <div className="relative">
                <select value={sort} onChange={(e) => setSort(e.target.value as SortMode)} className="h-11 w-full appearance-none rounded-xl border border-gray-200 bg-white px-3 pr-9 text-sm outline-none">
                  <option value="orden">Orden de la carta</option><option value="nombre">Nombre A-Z</option><option value="precio-asc">Precio menor → mayor</option><option value="precio-desc">Precio mayor → menor</option>
                </select>
                <ChevronDown size={17} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" />
              </div>
            </label>
            {hasFilters && <button type="button" onClick={clearFilters} className="text-left text-sm font-semibold text-gray-600 hover:text-gray-900 sm:col-span-3">Limpiar filtros</button>}
          </div>
        )}
      </section>

      <div className="flex items-center justify-between px-1 text-sm text-gray-500">
        <span>{filteredProductos.length} resultado{filteredProductos.length === 1 ? '' : 's'}</span>
        {counts.destacados > 0 && <span className="inline-flex items-center gap-1"><Star size={14} className="fill-current" /> {counts.destacados} destacados</span>}
      </div>

      <section className="space-y-2">
        {filteredProductos.map((producto) => {
          const busy = busyId === producto.id;
          return (
            <article key={producto.id} className="rounded-2xl border border-gray-200 bg-white p-3 shadow-sm transition hover:border-gray-300 sm:p-4">
              <div className="flex min-w-0 gap-3">
                {producto.foto_url ? (
                  <img src={producto.foto_url} alt="" className="h-16 w-16 shrink-0 rounded-xl object-cover bg-gray-100 sm:h-20 sm:w-20" />
                ) : (
                  <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-xl bg-gray-100 text-center text-[11px] font-medium text-gray-400 sm:h-20 sm:w-20">Sin foto</div>
                )}
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-start gap-x-2 gap-y-1">
                    <Link to={`/admin/productos/${producto.id}/editar`} className="min-w-0 text-base font-bold leading-tight text-gray-900 hover:underline sm:text-lg">{producto.nombre}</Link>
                    {producto.destacado && <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2 py-0.5 text-[11px] font-semibold text-amber-700"><Star size={11} className="fill-current" /> Destacado</span>}
                  </div>
                  <p className="mt-1 text-xs font-medium text-gray-500">{familiaMap.get(producto.familia_id) ?? 'Sin familia'}</p>
                  <p className="mt-1 line-clamp-2 text-sm text-gray-500">{producto.descripcion || 'Sin descripción'}</p>
                </div>
                <div className="shrink-0 text-right">
                  <div className="text-lg font-bold text-gray-900">{producto.precio.toFixed(2)} €</div>
                </div>
              </div>

              <div className="mt-3 flex flex-wrap items-center gap-2 border-t border-gray-100 pt-3">
                <button disabled={busy} type="button" onClick={() => void quickUpdate(producto, 'activo')} className={`inline-flex h-9 items-center gap-1.5 rounded-full px-3 text-xs font-semibold ${producto.activo ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                  {producto.activo ? <Eye size={14} /> : <EyeOff size={14} />}{producto.activo ? 'Visible' : 'Oculto'}
                </button>
                <button disabled={busy} type="button" onClick={() => void quickUpdate(producto, 'agotado')} className={`inline-flex h-9 items-center gap-1.5 rounded-full px-3 text-xs font-semibold ${producto.agotado ? 'bg-orange-100 text-orange-700' : 'bg-blue-100 text-blue-700'}`}>
                  {producto.agotado ? 'Agotado' : <><Check size={14} /> Disponible</>}
                </button>
                <button disabled={busy} type="button" onClick={() => void quickUpdate(producto, 'destacado')} className={`inline-flex h-9 items-center gap-1.5 rounded-full px-3 text-xs font-semibold ${producto.destacado ? 'bg-amber-100 text-amber-700' : 'bg-gray-100 text-gray-600'}`}>
                  <Star size={14} className={producto.destacado ? 'fill-current' : ''} /> {producto.destacado ? 'Destacado' : 'Destacar'}
                </button>
                <div className="ml-auto flex items-center gap-1">
                  <Link to={`/admin/productos/${producto.id}/editar`} className="inline-flex h-9 items-center gap-1.5 rounded-lg px-3 text-sm font-semibold text-gray-600 hover:bg-gray-100"><Edit size={16} /> <span className="hidden xs:inline">Editar</span></Link>
                  <button disabled={busy} type="button" onClick={() => void handleDelete(producto)} className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-gray-500 hover:bg-red-50 hover:text-red-600" aria-label={`Eliminar ${producto.nombre}`}><Trash2 size={17} /></button>
                </div>
              </div>
            </article>
          );
        })}

        {!filteredProductos.length && (
          <div className="rounded-2xl border border-dashed border-gray-300 bg-white px-6 py-12 text-center">
            <Search className="mx-auto text-gray-300" size={34} />
            <h2 className="mt-3 font-semibold text-gray-800">No hay productos que coincidan</h2>
            <p className="mt-1 text-sm text-gray-500">Prueba otra búsqueda o limpia los filtros.</p>
            {hasFilters && <button type="button" onClick={clearFilters} className="mt-4 rounded-lg px-4 py-2 text-sm font-semibold text-white" style={{ backgroundColor: 'var(--color-primary)' }}>Limpiar filtros</button>}
          </div>
        )}
      </section>
    </div>
  );
}
