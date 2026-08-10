import { useEffect, useState, type FormEvent } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Check, Image as ImageIcon, Save, Star } from 'lucide-react';
import { adminApi } from '../../services/adminApi';
import type { Alergeno, Familia, Producto } from '../../types/database';

function errorMessage(error: unknown): string {
  if (error && typeof error === 'object' && 'message' in error) return String((error as { message: unknown }).message);
  return String(error);
}

function normalize(value: string): string {
  return value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
}

function erudusIconPath(nombre: string): string | null {
  const key = normalize(nombre);
  const base = '/icons/alergenos/erudus';
  if (key.includes('gluten') || key.includes('cereal')) return `${base}/cereal.svg`;
  if (key.includes('crustace')) return `${base}/crustaceans.svg`;
  if (key.includes('huevo')) return `${base}/eggs.svg`;
  if (key.includes('pescado')) return `${base}/fish.svg`;
  if (key.includes('cacahuet')) return `${base}/peanuts.svg`;
  if (key.includes('soja')) return `${base}/soya.svg`;
  if (key.includes('leche') || key.includes('lact')) return `${base}/milk.svg`;
  if (key.includes('fruto') && key.includes('cascara')) return `${base}/nuts.svg`;
  if (key.includes('apio')) return `${base}/celery.svg`;
  if (key.includes('mostaza')) return `${base}/mustard.svg`;
  if (key.includes('sesamo')) return `${base}/sesame.svg`;
  if (key.includes('sulf') || key.includes('dioxido') || key.includes('azufre')) return `${base}/so2.svg`;
  if (key.includes('altramuc')) return `${base}/lupin.svg`;
  if (key.includes('molusc')) return `${base}/molluscs.svg`;
  return null;
}

function AlergenoIcon({ alergeno }: { alergeno: Alergeno }) {
  const [failed, setFailed] = useState(false);
  const iconPath = erudusIconPath(alergeno.nombre);

  if (iconPath && !failed) {
    return <img src={iconPath} alt="" className="h-7 w-7 shrink-0 object-contain" onError={() => setFailed(true)} />;
  }

  return <span className="h-7 w-7 shrink-0 rounded-full border border-white/20" aria-hidden="true" />;
}

export default function AdminProductoForm() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isEditing = Boolean(id);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [familias, setFamilias] = useState<Familia[]>([]);
  const [alergenos, setAlergenos] = useState<Alergeno[]>([]);
  const [nombre, setNombre] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [precio, setPrecio] = useState('');
  const [familiaId, setFamiliaId] = useState('');
  const [fotoUrl, setFotoUrl] = useState('');
  const [orden, setOrden] = useState('0');
  const [activo, setActivo] = useState(true);
  const [agotado, setAgotado] = useState(false);
  const [destacado, setDestacado] = useState(false);
  const [selectedAlergenos, setSelectedAlergenos] = useState<Set<string>>(new Set());

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const [f, a] = await Promise.all([adminApi.getFamiliasAdmin(), adminApi.getAlergenosAdmin()]);
        setFamilias(f);
        setAlergenos(a);
        if (isEditing && id) {
          const p = await adminApi.getProductoByIdAdmin(id);
          if (!p) {
            navigate('/admin/productos');
            return;
          }
          setNombre(p.nombre);
          setDescripcion(p.descripcion ?? '');
          setPrecio(String(p.precio));
          setFamiliaId(p.familia_id);
          setFotoUrl(p.foto_url ?? '');
          setOrden(String(p.orden ?? 0));
          setActivo(p.activo);
          setAgotado(p.agotado);
          setDestacado(p.destacado);
          setSelectedAlergenos(new Set((p.alergenos ?? []).map((x) => x.id)));
        } else if (f[0]) {
          setFamiliaId(f[0].id);
        }
      } catch (e) {
        console.error(e);
        alert(errorMessage(e));
      } finally {
        setLoading(false);
      }
    };
    void load();
  }, [id, navigate, isEditing]);

  const toggleAlergeno = (aid: string) => setSelectedAlergenos((current) => {
    const next = new Set(current);
    next.has(aid) ? next.delete(aid) : next.add(aid);
    return next;
  });

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const cleanName = nombre.trim();
    const parsedPrecio = Number(precio.replace(',', '.'));
    const parsedOrden = Number(orden);
    if (!cleanName) return alert('El producto necesita un nombre.');
    if (!familiaId) return alert('Debes seleccionar una familia.');
    if (!Number.isFinite(parsedPrecio) || parsedPrecio < 0) return alert('Introduce un precio válido.');
    if (!Number.isInteger(parsedOrden) || parsedOrden < 0) return alert('El orden debe ser un número entero igual o mayor que 0.');
    setSaving(true);
    try {
      const data: Partial<Producto> = {
        nombre: cleanName,
        descripcion: descripcion.trim() || null,
        precio: parsedPrecio,
        familia_id: familiaId,
        foto_url: fotoUrl.trim() || null,
        orden: parsedOrden,
        activo,
        agotado,
        destacado,
      };
      if (isEditing && id) await adminApi.updateProducto(id, data, [...selectedAlergenos]);
      else await adminApi.createProducto(data, [...selectedAlergenos]);
      navigate('/admin/productos');
    } catch (err) {
      console.error(err);
      alert(errorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="flex min-h-[50vh] items-center justify-center bg-[#111111]"><div className="h-7 w-7 animate-spin rounded-full border-b-2 border-orange-400" /></div>;
  }

  return (
    <div className="mx-auto min-h-[calc(100dvh-1rem)] w-full max-w-3xl bg-[#111111] px-2 pb-2 text-white sm:px-3">
      <header className="sticky top-0 z-20 flex h-12 items-center gap-2 border-b border-white/10 bg-[#111111]/95 backdrop-blur">
        <button type="button" onClick={() => navigate('/admin/productos')} className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-white/80 hover:bg-white/5" aria-label="Volver"><ArrowLeft size={19} /></button>
        <h1 className="truncate text-lg font-extrabold">{isEditing ? 'Editar artículo' : 'Nuevo artículo'}</h1>
        <div className="ml-auto flex items-center gap-3">
          {isEditing && <span className="text-xs font-semibold text-red-400">Eliminar</span>}
          <button form="producto-form" type="submit" disabled={saving} className="inline-flex h-8 items-center gap-1 rounded-md px-2 text-xs font-extrabold text-orange-400 hover:bg-orange-400/10 disabled:opacity-50"><Save size={15} />{saving ? 'Guardando…' : 'Guardar'}</button>
        </div>
      </header>

      <form id="producto-form" onSubmit={handleSubmit} className="space-y-2 pb-14 pt-2">
        <section className="rounded-xl border border-white/10 bg-[#171717] p-2.5 shadow-sm">
          <div className="grid grid-cols-[38%_minmax(0,1fr)] gap-2 max-[430px]:grid-cols-[35%_minmax(0,1fr)]">
            <div className="min-w-0">
              <div className="relative overflow-hidden rounded-lg border border-white/10 bg-[#202020]"><div className="aspect-square w-full">{fotoUrl ? <img src={fotoUrl} alt="Imagen del artículo" className="h-full w-full object-cover" onError={(e) => { e.currentTarget.style.display = 'none'; }} /> : <div className="flex h-full items-center justify-center text-white/30"><ImageIcon size={34} /></div>}</div></div>
              <label className="mt-1.5 block"><span className="sr-only">URL de imagen</span><input type="url" value={fotoUrl} onChange={(e) => setFotoUrl(e.target.value)} placeholder="URL imagen" className="h-7 w-full rounded-md border border-white/10 bg-[#202020] px-2 text-[10px] text-white outline-none placeholder:text-white/30 focus:border-orange-400/60" /></label>
            </div>
            <div className="min-w-0 space-y-1.5">
              <label className="block"><span className="mb-0.5 block text-[9px] font-semibold uppercase tracking-wide text-white/50">Nombre del artículo *</span><input required value={nombre} onChange={(e) => setNombre(e.target.value)} maxLength={100} className="h-9 w-full rounded-md border border-white/10 bg-[#202020] px-2.5 text-sm font-semibold text-white outline-none focus:border-orange-400/70" /></label>
              <label className="block"><span className="mb-0.5 block text-[9px] font-semibold uppercase tracking-wide text-white/50">Descripción</span><textarea value={descripcion} onChange={(e) => setDescripcion(e.target.value)} rows={4} maxLength={250} className="w-full resize-none rounded-md border border-white/10 bg-[#202020] px-2.5 py-1.5 text-xs leading-4 text-white outline-none focus:border-orange-400/70" /></label>
            </div>
          </div>
          <div className="mt-2 grid grid-cols-[1.35fr_.75fr_.55fr] gap-2 max-[430px]:grid-cols-[1.2fr_.7fr_.55fr]">
            <label className="block"><span className="mb-0.5 block text-[9px] font-semibold uppercase tracking-wide text-white/50">Categoría (familia) *</span><select required value={familiaId} onChange={(e) => setFamiliaId(e.target.value)} className="h-8 w-full rounded-md border border-white/10 bg-[#202020] px-2 text-xs text-white outline-none focus:border-orange-400/70"><option value="">Selecciona</option>{familias.map((f) => <option key={f.id} value={f.id}>{f.nombre}</option>)}</select></label>
            <label className="block"><span className="mb-0.5 block text-[9px] font-semibold uppercase tracking-wide text-white/50">Precio *</span><div className="relative"><input inputMode="decimal" required value={precio} onChange={(e) => setPrecio(e.target.value)} className="h-8 w-full rounded-md border border-white/10 bg-[#202020] px-2 text-xs text-white outline-none focus:border-orange-400/70" /><span className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-[10px] text-white/40">€</span></div></label>
            <label className="block"><span className="mb-0.5 block text-[9px] font-semibold uppercase tracking-wide text-white/50">Orden</span><input type="number" min="0" step="1" value={orden} onChange={(e) => setOrden(e.target.value)} className="h-8 w-full rounded-md border border-white/10 bg-[#202020] px-2 text-xs text-white outline-none focus:border-orange-400/70" /></label>
          </div>
          <div className="mt-2 grid grid-cols-3 gap-2">
            <label className="flex h-8 cursor-pointer items-center justify-between rounded-md border border-white/10 bg-[#202020] px-2.5"><span className="text-[10px] font-semibold uppercase text-white/55">Visible</span><span className={`flex h-4 w-7 items-center rounded-full p-0.5 transition ${activo ? 'bg-orange-400 justify-end' : 'bg-white/20 justify-start'}`}><span className="h-3 w-3 rounded-full bg-white shadow" /></span><input type="checkbox" checked={activo} onChange={(e) => setActivo(e.target.checked)} className="sr-only" /></label>
            <label className="flex h-8 cursor-pointer items-center justify-between rounded-md border border-white/10 bg-[#202020] px-2.5"><span className="text-[10px] font-semibold uppercase text-white/55">Disponible</span><span className={`flex h-4 w-7 items-center rounded-full p-0.5 transition ${!agotado ? 'bg-orange-400 justify-end' : 'bg-white/20 justify-start'}`}><span className="h-3 w-3 rounded-full bg-white shadow" /></span><input type="checkbox" checked={!agotado} onChange={(e) => setAgotado(!e.target.checked)} className="sr-only" /></label>
            <label className="flex h-8 cursor-pointer items-center justify-between rounded-md border border-white/10 bg-[#202020] px-2.5"><span className="inline-flex items-center gap-1 text-[10px] font-semibold uppercase text-white/55"><Star size={12} className={destacado ? 'text-orange-400' : ''} />Destacado</span><span className={`flex h-4 w-7 items-center rounded-full p-0.5 transition ${destacado ? 'bg-orange-400 justify-end' : 'bg-white/20 justify-start'}`}><span className="h-3 w-3 rounded-full bg-white shadow" /></span><input type="checkbox" checked={destacado} onChange={(e) => setDestacado(e.target.checked)} className="sr-only" /></label>
          </div>
        </section>

        <section className="rounded-xl border border-white/10 bg-[#171717] p-2.5 shadow-sm">
          <div className="mb-1.5 flex items-end justify-between"><div><h2 className="text-sm font-extrabold">Alérgenos</h2><p className="text-[9px] text-white/40">Selecciona los alérgenos que contiene este artículo.</p></div><span className="rounded-full bg-white/10 px-2 py-0.5 text-[10px] font-bold text-orange-400">{selectedAlergenos.size}</span></div>
          <div className="grid grid-cols-2 gap-1">{alergenos.map((a) => { const selected = selectedAlergenos.has(a.id); return <label key={a.id} title={a.nombre} className={`flex h-8 cursor-pointer items-center gap-2 rounded-md border px-1.5 transition ${selected ? 'border-orange-400/60 bg-orange-400/10' : 'border-white/10 bg-[#202020] hover:border-white/20'}`}><input type="checkbox" checked={selected} onChange={() => toggleAlergeno(a.id)} className="sr-only" /><span className={`flex h-4 w-4 shrink-0 items-center justify-center rounded-sm border ${selected ? 'border-orange-400 bg-orange-400 text-[#111]' : 'border-white/30 bg-transparent text-transparent'}`}><Check size={12} strokeWidth={3} /></span><AlergenoIcon alergeno={a} /><span className="min-w-0 truncate text-[10px] font-semibold text-white/80">{a.nombre}</span></label>; })}</div>
        </section>

        <div className="sticky bottom-0 z-20 -mx-2 border-t border-white/10 bg-[#111111]/95 p-2 backdrop-blur sm:-mx-3"><div className="mx-auto flex max-w-3xl gap-2"><button type="button" onClick={() => navigate('/admin/productos')} className="h-9 flex-1 rounded-md border border-white/10 bg-[#202020] text-xs font-bold text-white/65">Cancelar</button><button type="submit" disabled={saving} className="h-9 flex-[1.7] rounded-md bg-orange-400 text-xs font-extrabold text-[#111] shadow-sm disabled:opacity-50"><span className="inline-flex items-center justify-center gap-1.5"><Save size={15} />{saving ? 'Guardando…' : 'Guardar cambios'}</span></button></div></div>
      </form>
    </div>
  );
}
