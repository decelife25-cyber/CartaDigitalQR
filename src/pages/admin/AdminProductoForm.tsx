import { useEffect, useState, type FormEvent } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Check, Eye, Image as ImageIcon, Save, Star } from 'lucide-react';
import { adminApi } from '../../services/adminApi';
import type { Alergeno, Familia, Producto } from '../../types/database';

function errorMessage(error: unknown): string {
  if (error && typeof error === 'object' && 'message' in error) return String((error as { message: unknown }).message);
  return String(error);
}

function normalize(value: string): string {
  return value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
}

function AlergenoIcon({ alergeno }: { alergeno: Alergeno }) {
  const [failed, setFailed] = useState(false);
  if (alergeno.icono && !failed) {
    return <img src={alergeno.icono} alt="" className="h-9 w-9 object-contain" onError={() => setFailed(true)} />;
  }
  const symbol: Record<string, string> = {
    gluten: '🌾', crustaceos: '🦐', huevos: '🥚', pescado: '🐟', cacahuetes: '🥜', soja: '🫘', lacteos: '🥛',
    'frutos de cascara': '🌰', apio: '🌿', mostaza: '🟡', sesamo: '🌱', sulfitos: '🧪', altramuces: '🌼', moluscos: '🦪',
  };
  const key = Object.keys(symbol).find((name) => normalize(alergeno.nombre).includes(name));
  return <span className="text-[28px] leading-none" aria-hidden="true">{key ? symbol[key] : '◉'}</span>;
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

  if (loading) return <div className="flex min-h-[50vh] items-center justify-center"><div className="h-7 w-7 animate-spin rounded-full border-b-2 border-[var(--color-primary)]" /></div>;

  return (
    <div className="mx-auto min-h-[calc(100dvh-1rem)] w-full max-w-3xl px-2 pb-2 sm:px-3">
      <header className="sticky top-0 z-20 flex h-12 items-center gap-2 border-b border-slate-200 bg-slate-50/95 backdrop-blur">
        <button type="button" onClick={() => navigate('/admin/productos')} className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-slate-700 shadow-sm" aria-label="Volver"><ArrowLeft size={20} /></button>
        <h1 className="truncate text-xl font-extrabold text-slate-900">{isEditing ? 'Editar producto' : 'Nuevo producto'}</h1>
        <span className="ml-auto shrink-0 text-xs font-bold text-slate-400">{selectedAlergenos.size} alérgenos</span>
      </header>

      <form onSubmit={handleSubmit} className="space-y-2 pt-2 pb-16">
        <section className="rounded-2xl border border-slate-200 bg-white p-3 shadow-sm">
          <div className="grid grid-cols-[minmax(0,1fr)_84px] gap-2">
            <div className="min-w-0">
              <label className="block"><span className="mb-1 block text-sm font-bold text-slate-600">Nombre *</span><input required value={nombre} onChange={(e) => setNombre(e.target.value)} className="h-10 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 text-[15px] font-semibold outline-none focus:border-[var(--color-primary)]" /></label>
              <div className="mt-2 grid grid-cols-[minmax(0,1fr)_90px] gap-2">
                <label className="block"><span className="mb-1 block text-sm font-bold text-slate-600">Familia *</span><select required value={familiaId} onChange={(e) => setFamiliaId(e.target.value)} className="h-10 w-full rounded-xl border border-slate-200 bg-slate-50 px-2 text-sm outline-none"><option value="">Selecciona</option>{familias.map((f) => <option key={f.id} value={f.id}>{f.nombre}</option>)}</select></label>
                <label className="block"><span className="mb-1 block text-sm font-bold text-slate-600">Precio</span><input inputMode="decimal" required value={precio} onChange={(e) => setPrecio(e.target.value)} className="h-10 w-full rounded-xl border border-slate-200 bg-slate-50 px-2 text-sm outline-none" /></label>
              </div>
            </div>
            <div className="flex h-[84px] items-center justify-center overflow-hidden rounded-xl bg-slate-100 text-slate-400">{fotoUrl ? <img src={fotoUrl} alt="Vista previa" className="h-full w-full object-cover" onError={(e) => { e.currentTarget.style.display = 'none'; }} /> : <ImageIcon size={28} />}</div>
          </div>

          <div className="mt-2 grid grid-cols-[minmax(0,1fr)_72px] gap-2">
            <label className="block"><span className="mb-1 block text-sm font-bold text-slate-600">Descripción</span><textarea rows={2} value={descripcion} onChange={(e) => setDescripcion(e.target.value)} className="w-full resize-none rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm leading-4 outline-none" /></label>
            <label className="block"><span className="mb-1 block text-sm font-bold text-slate-600">Orden</span><input type="number" min="0" step="1" value={orden} onChange={(e) => setOrden(e.target.value)} className="h-10 w-full rounded-xl border border-slate-200 bg-slate-50 px-2 text-sm outline-none" /></label>
          </div>

          <label className="mt-2 block"><span className="mb-1 block text-sm font-bold text-slate-600">URL imagen</span><input type="url" value={fotoUrl} onChange={(e) => setFotoUrl(e.target.value)} placeholder="https://..." className="h-9 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 text-xs outline-none" /></label>
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white p-3 shadow-sm">
          <div className="mb-2 flex items-center justify-between"><h2 className="text-lg font-extrabold text-slate-900">Estado</h2><span className="text-xs text-slate-400">Toca para activar</span></div>
          <div className="grid grid-cols-3 gap-2">
            <label className={`flex h-[68px] cursor-pointer flex-col items-center justify-center rounded-xl border ${activo ? 'border-green-300 bg-green-50' : 'border-slate-200 bg-white'}`}><input type="checkbox" checked={activo} onChange={(e) => setActivo(e.target.checked)} className="sr-only" /><Eye size={21} /><span className="mt-1 text-sm font-bold">Visible</span></label>
            <label className={`flex h-[68px] cursor-pointer flex-col items-center justify-center rounded-xl border ${!agotado ? 'border-blue-300 bg-blue-50' : 'border-slate-200 bg-white'}`}><input type="checkbox" checked={!agotado} onChange={(e) => setAgotado(!e.target.checked)} className="sr-only" /><Check size={21} /><span className="mt-1 text-sm font-bold">Disponible</span></label>
            <label className={`flex h-[68px] cursor-pointer flex-col items-center justify-center rounded-xl border ${destacado ? 'border-amber-300 bg-amber-50' : 'border-slate-200 bg-white'}`}><input type="checkbox" checked={destacado} onChange={(e) => setDestacado(e.target.checked)} className="sr-only" /><Star size={22} className={destacado ? 'fill-current' : ''} /><span className="mt-1 text-sm font-bold">Destacado</span></label>
          </div>

          <div className="mt-3 flex items-center justify-between"><h2 className="text-lg font-extrabold text-slate-900">Alérgenos</h2><span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-bold text-slate-600">{selectedAlergenos.size}</span></div>
          <div className="mt-2 grid grid-cols-7 gap-1.5 max-[430px]:grid-cols-4">
            {alergenos.map((a) => {
              const selected = selectedAlergenos.has(a.id);
              return <label key={a.id} title={a.nombre} className={`relative flex min-h-[64px] cursor-pointer flex-col items-center justify-center rounded-xl border px-0.5 text-center ${selected ? 'border-[var(--color-primary)] bg-slate-50' : 'border-slate-200 bg-white'}`}>
                <input type="checkbox" checked={selected} onChange={() => toggleAlergeno(a.id)} className="sr-only" />
                <AlergenoIcon alergeno={a} />
                <span className="mt-1 w-full break-words text-[10px] font-bold leading-3 text-slate-600">{a.nombre}</span>
                {selected && <span className="absolute right-0.5 top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-[var(--color-primary)] text-white"><Check size={10} /></span>}
              </label>;
            })}
          </div>
        </section>

        <div className="sticky bottom-0 z-20 -mx-2 border-t border-slate-200 bg-slate-50/95 p-2 backdrop-blur sm:-mx-3">
          <div className="mx-auto flex max-w-3xl gap-2">
            <button type="button" onClick={() => navigate('/admin/productos')} className="h-11 flex-1 rounded-xl bg-slate-200 text-sm font-bold text-slate-700">Cancelar</button>
            <button type="submit" disabled={saving} className="h-11 flex-[1.6] rounded-xl text-sm font-extrabold text-white shadow-sm disabled:opacity-50" style={{ backgroundColor: 'var(--color-primary)' }}><span className="inline-flex items-center justify-center gap-2"><Save size={18} />{saving ? 'Guardando…' : 'Guardar cambios'}</span></button>
          </div>
        </div>
      </form>
    </div>
  );
}
