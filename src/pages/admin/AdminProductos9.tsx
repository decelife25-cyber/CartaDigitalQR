import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Check, ChevronDown, Edit, Eye, EyeOff, Filter, Image as ImageIcon, PackagePlus, Plus, Search, Star, Trash2, Wheat, X } from 'lucide-react';
import { adminApi } from '../../services/adminApi';
import type { Familia, Producto } from '../../types/database';

function errorMessage(error: unknown): string {
  if (error && typeof error === 'object' && 'message' in error) return String((error as { message: unknown }).message);
  return String(error);
}

type StatusFilter = 'todos' | 'visibles' | 'ocultos' | 'disponibles' | 'agotados' | 'destacados';
type SortMode = 'orden' | 'nombre' | 'precio-asc' | 'precio-desc';

export default function AdminProductos9() {
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

  const load = async () => {
    setLoading(true); setError(null);
    try {
      const [products, families] = await Promise.all([adminApi.getProductosAdmin(), adminApi.getFamiliasAdmin()]);
      setProductos(products); setFamilias(families);
    } catch (err) { setError(errorMessage(err)); }
    finally { setLoading(false); }
  };

  useEffect(() => { void load(); }, []);

  const familiaMap = useMemo(() => new Map(familias.map((f) => [f.id, f.nombre])), [familias]);
  const filtered = useMemo(() => {
    const q = search.trim().toLocaleLowerCase();
    const result = productos.filter((p) => {
      const text = [p.nombre, p.descripcion ?? '', familiaMap.get(p.familia_id) ?? ''].join(' ').toLocaleLowerCase();
      const familyOk = familiaId === 'todas' || p.familia_id === familiaId;
      const statusOk = status === 'todos' ||
        (status === 'visibles' && p.activo) || (status === 'ocultos' && !p.activo) ||
        (status === 'disponibles' && !p.agotado) || (status === 'agotados' && p.agotado) ||
        (status === 'destacados' && p.destacado);
      return (!q || text.includes(q)) && familyOk && statusOk;
    });
    return [...result].sort((a, b) => sort === 'nombre' ? a.nombre.localeCompare(b.nombre, 'es') : sort === 'precio-asc' ? a.precio - b.precio : sort === 'precio-desc' ? b.precio - a.precio : a.orden - b.orden);
  }, [productos, familiaMap, search, familiaId, status, sort]);

  const counts = useMemo(() => ({
    total: productos.length,
    visibles: productos.filter((p) => p.activo).length,
    agotados: productos.filter((p) => p.agotado).length,
  }), [productos]);

  const hasFilters = Boolean(search || familiaId !== 'todas' || status !== 'todos' || sort !== 'orden');
  const clearFilters = () => { setSearch(''); setFamiliaId('todas'); setStatus('todos'); setSort('orden'); };

  const quickUpdate = async (p: Producto, field: 'activo' | 'agotado' | 'destacado') => {
    setBusyId(p.id);
    try {
      const next = !p[field];
      await adminApi.updateProductoFields(p.id, { [field]: next });
      setProductos((current) => current.map((item) => item.id === p.id ? { ...item, [field]: next } : item));
    } catch (err) { alert(errorMessage(err)); }
    finally { setBusyId(null); }
  };

  const remove = async (p: Producto) => {
    if (!window.confirm(`¿Eliminar «${p.nombre}»? Esta acción no se puede deshacer.`)) return;
    setBusyId(p.id);
    try { await adminApi.deleteProducto(p.id); setProductos((current) => current.filter((item) => item.id !== p.id)); }
    catch (err) { alert(errorMessage(err)); }
    finally { setBusyId(null); }
  };

  if (loading) return <div className="flex min-h-[60vh] items-center justify-center bg-[#111111]"><div className="h-7 w-7 animate-spin rounded-full border-b-2 border-orange-400" /></div>;

  if (error) return (
    <div className="mx-auto max-w-xl rounded-xl border border-red-400/20 bg-[#171717] p-5 text-white">
      <h1 className="text-lg font-extrabold">No se pueden cargar los productos</h1>
      <p className="mt-2 text-sm text-red-300">{error}</p>
      <button type="button" onClick={() => void load()} className="mt-4 rounded-lg bg-orange-400 px-4 py-2 text-sm font-extrabold text-[#111]">Reintentar</button>
    </div>
  );

  return (
    <div className="mx-auto min-h-[calc(100dvh-1rem)] w-full max-w-3xl bg-[#111111] px-2 pb-4 text-white sm:px-3">
      <header className="sticky top-0 z-30 flex h-12 items-center gap-2 border-b border-white/10 bg-[#111111]/95 backdrop-blur">
        <Link to="/admin" className="flex h-9 w-9 items-center justify-center rounded-lg text-white/70 hover:bg-white/5" aria-label="Volver al inicio"><ArrowLeft size={19} /></Link>
        <div className="min-w-0">
          <h1 className="truncate text-lg font-extrabold">Productos</h1>
          <p className="text-[9px] font-semibold uppercase tracking-wide text-white/35">{counts.total} artículos · {counts.visibles} visibles · {counts.agotados} agotados</p>
        </div>
        <Link to="/admin/productos/nuevo" className="ml-auto inline-flex h-8 items-center gap-1 rounded-md bg-orange-400 px-2.5 text-xs font-extrabold text-[#111]"><Plus size={15} /> Nuevo</Link>
      </header>

      <section className="mt-2 rounded-xl border border-white/10 bg-[#171717] p-2">
        <div className="flex gap-2">
          <label className="relative min-w-0 flex-1">
            <Search size={17} className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-white/30" />
            <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Buscar producto..." className="h-9 w-full rounded-md border border-white/10 bg-[#202020] pl-8 pr-8 text-xs text-white outline-none placeholder:text-white/30 focus:border-orange-400/60" />
            {search && <button type="button" onClick={() => setSearch('')} className="absolute right-2 top-1/2 -translate-y-1/2 text-white/40"><X size={15} /></button>}
          </label>
          <button type="button" onClick={() => setShowFilters((v) => !v)} className={`inline-flex h-9 shrink-0 items-center gap-1 rounded-md border px-2.5 text-xs font-bold ${showFilters || hasFilters ? 'border-orange-400/60 bg-orange-400/10 text-orange-300' : 'border-white/10 text-white/60'}`}><Filter size={15} /> Filtros</button>
          <button type="button" onClick={() => void load()} className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md border border-white/10 text-white/55" aria-label="Actualizar"><PackagePlus size={16} /></button>
        </div>
        {showFilters && <div className="mt-2 grid grid-cols-3 gap-1.5 border-t border-white/10 pt-2">
          <select value={familiaId} onChange={(e) => setFamiliaId(e.target.value)} className="h-8 rounded-md border border-white/10 bg-[#202020] px-2 text-[10px] text-white outline-none"><option value="todas">Todas las familias</option>{familias.filter((f) => f.activo).map((f) => <option key={f.id} value={f.id}>{f.nombre}</option>)}</select>
          <select value={status} onChange={(e) => setStatus(e.target.value as StatusFilter)} className="h-8 rounded-md border border-white/10 bg-[#202020] px-2 text-[10px] text-white outline-none"><option value="todos">Todos</option><option value="visibles">Visibles</option><option value="ocultos">Ocultos</option><option value="disponibles">Disponibles</option><option value="agotados">Agotados</option><option value="destacados">Destacados</option></select>
          <select value={sort} onChange={(e) => setSort(e.target.value as SortMode)} className="h-8 rounded-md border border-white/10 bg-[#202020] px-2 text-[10px] text-white outline-none"><option value="orden">Orden carta</option><option value="nombre">Nombre A-Z</option><option value="precio-asc">Precio ↑</option><option value="precio-desc">Precio ↓</option></select>
          {hasFilters && <button type="button" onClick={clearFilters} className="col-span-3 text-left text-[10px] font-bold text-orange-300">Limpiar filtros</button>}
        </div>}
      </section>

      <div className="flex items-center justify-between px-1 py-2 text-[10px] font-semibold text-white/35"><span>{filtered.length} resultado{filtered.length === 1 ? '' : 's'}</span><span>Orden de carta</span></div>

      <section className="space-y-1.5">
        {filtered.map((p) => {
          const busy = busyId === p.id;
          return <article key={p.id} className="rounded-xl border border-white/10 bg-[#171717] p-2.5">
            <div className="flex min-w-0 gap-2.5">
              <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-lg bg-[#202020] sm:h-18 sm:w-18">
                {p.foto_url ? <img src={p.foto_url} alt="" className="h-full w-full object-cover" /> : <div className="flex h-full items-center justify-center text-white/20"><ImageIcon size={24} /></div>}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-start gap-2"><Link to={`/admin/productos/${p.id}/editar`} className="min-w-0 truncate text-sm font-extrabold text-white">{p.nombre}</Link>{p.destacado && <Star size={13} className="mt-0.5 shrink-0 fill-orange-400 text-orange-400" />}</div>
                <p className="mt-0.5 truncate text-[10px] font-semibold text-orange-300/80">{familiaMap.get(p.familia_id) ?? 'Sin familia'}</p>
                <p className="mt-0.5 line-clamp-1 text-[10px] text-white/40">{p.descripcion || 'Sin descripción'}</p>
                <div className="mt-1 flex flex-wrap items-center gap-1.5 text-[9px] font-semibold text-white/40">
                  <span className="inline-flex items-center gap-1">{p.foto_url ? <ImageIcon size={11} className="text-green-400" /> : <ImageIcon size={11} />}{p.foto_url ? 'Foto' : 'Sin foto'}</span>
                  <span className="inline-flex items-center gap-1"><Wheat size={11} className={p.alergenos?.length ? 'text-orange-300' : ''} />{p.alergenos?.length ?? 0} alérgeno{(p.alergenos?.length ?? 0) === 1 ? '' : 's'}</span>
                </div>
              </div>
              <div className="shrink-0 text-right"><div className="text-base font-extrabold text-white">{p.precio.toFixed(2)} €</div></div>
            </div>
            <div className="mt-2 flex flex-wrap items-center gap-1.5 border-t border-white/10 pt-2">
              <button disabled={busy} type="button" onClick={() => void quickUpdate(p, 'activo')} className={`inline-flex h-7 items-center gap-1 rounded-md px-2 text-[10px] font-bold ${p.activo ? 'bg-green-400/10 text-green-300' : 'bg-white/5 text-white/45'}`}>{p.activo ? <Eye size={12} /> : <EyeOff size={12} />}{p.activo ? 'Visible' : 'Oculto'}</button>
              <button disabled={busy} type="button" onClick={() => void quickUpdate(p, 'agotado')} className={`inline-flex h-7 items-center gap-1 rounded-md px-2 text-[10px] font-bold ${p.agotado ? 'bg-red-400/10 text-red-300' : 'bg-green-400/10 text-green-300'}`}>{p.agotado ? 'Agotado' : <><Check size={12} /> Disponible</>}</button>
              <button disabled={busy} type="button" onClick={() => void quickUpdate(p, 'destacado')} className={`inline-flex h-7 items-center gap-1 rounded-md px-2 text-[10px] font-bold ${p.destacado ? 'bg-orange-400/10 text-orange-300' : 'bg-white/5 text-white/45'}`}><Star size={12} className={p.destacado ? 'fill-current' : ''} />{p.destacado ? 'Destacado' : 'Destacar'}</button>
              <Link to={`/admin/productos/${p.id}/editar`} className="ml-auto inline-flex h-7 items-center gap-1 rounded-md px-2 text-[10px] font-bold text-white/60 hover:bg-white/5"><Edit size={13} /> Editar</Link>
              <button disabled={busy} type="button" onClick={() => void remove(p)} className="flex h-7 w-7 items-center justify-center rounded-md text-white/35 hover:bg-red-400/10 hover:text-red-300" aria-label={`Eliminar ${p.nombre}`}><Trash2 size={13} /></button>
            </div>
          </article>;
        })}
        {!filtered.length && <div className="rounded-xl border border-dashed border-white/15 bg-[#171717] px-5 py-12 text-center"><Search className="mx-auto text-white/20" size={28} /><p className="mt-2 text-sm font-bold text-white/65">No hay productos que coincidan</p>{hasFilters && <button type="button" onClick={clearFilters} className="mt-3 rounded-md bg-orange-400 px-3 py-1.5 text-xs font-extrabold text-[#111]">Limpiar filtros</button>}</div>}
      </section>
    </div>
  );
}
