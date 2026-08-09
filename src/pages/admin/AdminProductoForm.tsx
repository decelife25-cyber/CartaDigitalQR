import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import type { LucideIcon } from 'lucide-react';
import { ArrowLeft, Bean, CircleDot, Egg, Fish, FlaskConical, Image as ImageIcon, Leaf, Milk, Nut, Save, Sprout, Star, Waves, Wheat } from 'lucide-react';
import { adminApi } from '../../services/adminApi';
import type { Alergeno, Familia, Producto } from '../../types/database';

function errorMessage(error: unknown): string {
  if (error && typeof error === 'object' && 'message' in error) return String((error as { message: unknown }).message);
  return String(error);
}

function normalize(value: string): string {
  return value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
}

const allergenIcons: Array<[string[], LucideIcon]> = [
  [['gluten'], Wheat], [['crustaceos'], Fish], [['huevos', 'huevo'], Egg], [['pescado'], Fish],
  [['cacahuetes', 'cacahuete'], Nut], [['soja'], Bean], [['lacteos', 'lacteo'], Milk],
  [['frutos de cascara', 'frutos cascara'], Nut], [['apio'], Leaf], [['mostaza'], Sprout],
  [['sesamo'], Wheat], [['sulfitos'], FlaskConical], [['altramuces', 'altramuz'], Sprout], [['moluscos'], Waves],
];

function getAllergenIcon(nombre: string): LucideIcon {
  const key = normalize(nombre);
  return allergenIcons.find(([names]) => names.some((name) => key.includes(name)))?.[1] ?? CircleDot;
}

function AlergenoIcon({ alergeno }: { alergeno: Alergeno }) {
  const [imageFailed, setImageFailed] = useState(false);
  const FallbackIcon = getAllergenIcon(alergeno.nombre);
  if (alergeno.icono && !imageFailed) return <img src={alergeno.icono} alt="" className="h-9 w-9 object-contain" onError={() => setImageFailed(true)} />;
  return <FallbackIcon size={36} strokeWidth={1.8} className="text-gray-500" aria-hidden="true" />;
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
    const loadData = async () => {
      setLoading(true);
      try {
        const [familiasData, alergenosData] = await Promise.all([adminApi.getFamiliasAdmin(), adminApi.getAlergenosAdmin()]);
        setFamilias(familiasData);
        setAlergenos(alergenosData);
        if (isEditing && id) {
          const producto = await adminApi.getProductoByIdAdmin(id);
          if (!producto) { navigate('/admin/productos'); return; }
          setNombre(producto.nombre);
          setDescripcion(producto.descripcion ?? '');
          setPrecio(String(producto.precio));
          setFamiliaId(producto.familia_id);
          setFotoUrl(producto.foto_url ?? '');
          setOrden(String(producto.orden ?? 0));
          setActivo(producto.activo);
          setAgotado(producto.agotado);
          setDestacado(producto.destacado);
          setSelectedAlergenos(new Set((producto.alergenos ?? []).map((a) => a.id)));
        } else if (familiasData.length) setFamiliaId(familiasData[0].id);
      } catch (error) {
        console.error('Error loading form data:', error);
        alert(errorMessage(error));
      } finally { setLoading(false); }
    };
    void loadData();
  }, [id, navigate, isEditing]);

  const toggleAlergeno = (alergenoId: string) => {
    const next = new Set(selectedAlergenos);
    if (next.has(alergenoId)) next.delete(alergenoId); else next.add(alergenoId);
    setSelectedAlergenos(next);
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    const cleanName = nombre.trim();
    const parsedPrecio = Number(precio.replace(',', '.'));
    const parsedOrden = Number(orden);
    if (!cleanName) return alert('El producto necesita un nombre.');
    if (!familiaId) return alert('Debes seleccionar una familia.');
    if (!Number.isFinite(parsedPrecio) || parsedPrecio < 0) return alert('Introduce un precio válido.');
    if (!Number.isInteger(parsedOrden) || parsedOrden < 0) return alert('El orden debe ser un número entero igual o mayor que 0.');
    setSaving(true);
    try {
      const productoData: Partial<Producto> = { nombre: cleanName, descripcion: descripcion.trim() || null, precio: parsedPrecio, familia_id: familiaId, foto_url: fotoUrl.trim() || null, orden: parsedOrden, activo, agotado, destacado };
      if (isEditing && id) await adminApi.updateProducto(id, productoData, Array.from(selectedAlergenos));
      else await adminApi.createProducto(productoData, Array.from(selectedAlergenos));
      navigate('/admin/productos');
    } catch (error) {
      console.error('Error saving producto:', error);
      alert(errorMessage(error));
    } finally { setSaving(false); }
  };

  if (loading) return <div className="flex min-h-[40vh] items-center justify-center"><div className="h-8 w-8 animate-spin rounded-full border-b-2 border-[var(--color-primary)]" /></div>;

  return (
    <div className="mx-auto w-full max-w-4xl pb-4">
      <header className="mb-3 flex items-center gap-3 px-1">
        <button type="button" onClick={() => navigate('/admin/productos')} className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-gray-200 bg-white text-gray-600 shadow-sm" aria-label="Volver a productos"><ArrowLeft size={22} /></button>
        <div className="min-w-0"><h1 className="truncate text-2xl font-bold tracking-tight text-gray-900">{isEditing ? 'Editar producto' : 'Nuevo producto'}</h1><p className="text-sm text-gray-500">Información del producto y lo que verá el cliente.</p></div>
      </header>

      <form onSubmit={handleSubmit} className="overflow-hidden rounded-[28px] border border-gray-200 bg-white shadow-sm">
        <section className="p-4 sm:p-5">
          <div className="mb-4"><h2 className="text-lg font-bold text-gray-900">Información básica</h2><p className="mt-0.5 text-sm text-gray-500">Nombre, precio, familia y descripción.</p></div>
          <div className="grid gap-3 sm:grid-cols-[1fr_150px]">
            <label className="space-y-1.5 sm:col-span-2"><span className="text-sm font-semibold text-gray-700">Nombre *</span><input required value={nombre} onChange={(e) => setNombre(e.target.value)} placeholder="Ej. Huevos rotos con jamón ibérico" className="h-11 w-full rounded-xl border border-gray-200 bg-gray-50 px-3.5 text-base outline-none focus:border-[var(--color-primary)] focus:bg-white" /></label>
            <label className="space-y-1.5"><span className="text-sm font-semibold text-gray-700">Familia *</span><select required value={familiaId} onChange={(e) => setFamiliaId(e.target.value)} className="h-11 w-full rounded-xl border border-gray-200 bg-gray-50 px-3 text-sm outline-none focus:border-[var(--color-primary)] focus:bg-white"><option value="">Selecciona una familia</option>{familias.map((familia) => <option key={familia.id} value={familia.id}>{familia.nombre}{!familia.activo ? ' (oculta)' : ''}</option>)}</select></label>
            <label className="space-y-1.5"><span className="text-sm font-semibold text-gray-700">Precio (€) *</span><input inputMode="decimal" type="text" required value={precio} onChange={(e) => setPrecio(e.target.value)} placeholder="12,50" className="h-11 w-full rounded-xl border border-gray-200 bg-gray-50 px-3 text-sm outline-none focus:border-[var(--color-primary)] focus:bg-white" /></label>
            <label className="space-y-1.5 sm:col-span-2"><span className="text-sm font-semibold text-gray-700">Descripción</span><textarea rows={2} value={descripcion} onChange={(e) => setDescripcion(e.target.value)} placeholder="Describe brevemente el plato..." className="w-full resize-y rounded-xl border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm outline-none focus:border-[var(--color-primary)] focus:bg-white" /></label>
            <label className="space-y-1.5"><span className="text-sm font-semibold text-gray-700">Orden</span><input type="number" min="0" step="1" value={orden} onChange={(e) => setOrden(e.target.value)} className="h-11 w-full rounded-xl border border-gray-200 bg-gray-50 px-3 text-sm outline-none focus:border-[var(--color-primary)] focus:bg-white" /></label>
          </div>
        </section>

        <div className="border-t border-gray-100" />
        <section className="p-4 sm:p-5">
          <div className="mb-3"><h2 className="text-lg font-bold text-gray-900">Imagen</h2><p className="mt-0.5 text-sm text-gray-500">La fotografía se mostrará en la carta.</p></div>
          <div className="grid grid-cols-[92px_1fr] items-center gap-3">
            <div className="flex h-[92px] w-[92px] items-center justify-center overflow-hidden rounded-2xl bg-gray-100 text-gray-400">{fotoUrl ? <img src={fotoUrl} alt="Vista previa" className="h-full w-full object-cover" onError={(e) => { e.currentTarget.style.display = 'none'; }} /> : <ImageIcon size={30} />}</div>
            <label className="min-w-0 space-y-1.5"><span className="text-sm font-semibold text-gray-700">URL de la imagen</span><input type="url" value={fotoUrl} onChange={(e) => setFotoUrl(e.target.value)} placeholder="https://..." className="h-11 w-full rounded-xl border border-gray-200 bg-gray-50 px-3 text-sm outline-none focus:border-[var(--color-primary)] focus:bg-white" /><span className="block text-xs text-gray-500">Puedes dejarla vacía si todavía no tienes foto.</span></label>
          </div>
        </section>

        <div className="border-t border-gray-100" />
        <section className="p-4 sm:p-5">
          <div className="mb-3"><h2 className="text-lg font-bold text-gray-900">Estado del producto</h2><p className="mt-0.5 text-sm text-gray-500">Controla cómo aparece y si se puede pedir.</p></div>
          <div className="grid gap-2 sm:grid-cols-3">
            <label className={`flex min-h-[82px] cursor-pointer items-center gap-3 rounded-2xl border-2 px-4 py-3 ${activo ? 'border-green-200 bg-green-50' : 'border-gray-200 bg-gray-50'}`}><input type="checkbox" checked={activo} onChange={(e) => setActivo(e.target.checked)} className="h-5 w-5 shrink-0 accent-green-600" /><div><p className="text-base font-bold text-gray-800">Visible</p><p className="text-sm text-gray-500">Aparece en la carta</p></div></label>
            <label className={`flex min-h-[82px] cursor-pointer items-center gap-3 rounded-2xl border-2 px-4 py-3 ${!agotado ? 'border-blue-200 bg-blue-50' : 'border-gray-200 bg-gray-50'}`}><input type="checkbox" checked={!agotado} onChange={(e) => setAgotado(!e.target.checked)} className="h-5 w-5 shrink-0 accent-blue-600" /><div><p className="text-base font-bold text-gray-800">Disponible</p><p className="text-sm text-gray-500">Se puede pedir</p></div></label>
            <label className={`flex min-h-[82px] cursor-pointer items-center gap-3 rounded-2xl border-2 px-4 py-3 ${destacado ? 'border-amber-200 bg-amber-50' : 'border-gray-200 bg-gray-50'}`}><input type="checkbox" checked={destacado} onChange={(e) => setDestacado(e.target.checked)} className="h-5 w-5 shrink-0 accent-amber-500" /><div><p className="flex items-center gap-1.5 text-base font-bold text-gray-800"><Star size={16} className={destacado ? 'fill-current text-amber-500' : 'text-gray-500'} />Destacado</p><p className="text-sm text-gray-500">Resaltar en la carta</p></div></label>
          </div>
        </section>

        <div className="border-t border-gray-100" />
        <section className="p-4 sm:p-5">
          <div className="flex items-start justify-between gap-3"><div><h2 className="text-lg font-bold text-gray-900">Alérgenos</h2><p className="mt-0.5 text-sm text-gray-500">Selecciona todos los que correspondan al plato.</p></div><span className="shrink-0 rounded-full bg-gray-100 px-3 py-1.5 text-xs font-bold text-gray-600">{selectedAlergenos.size} seleccionados</span></div>
          <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4">
            {alergenos.map((alergeno) => { const selected = selectedAlergenos.has(alergeno.id); return <label key={alergeno.id} className={`flex min-h-[92px] cursor-pointer flex-col items-center justify-center gap-1.5 rounded-2xl border-2 px-1 py-2 text-center transition ${selected ? 'border-gray-900 bg-gray-50' : 'border-gray-200 bg-white'}`}><input type="checkbox" className="sr-only" checked={selected} onChange={() => toggleAlergeno(alergeno.id)} /><div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gray-50"><AlergenoIcon alergeno={alergeno} /></div><span className="text-xs font-bold leading-4 text-gray-700">{alergeno.nombre}</span></label>; })}
          </div>
          {!alergenos.length && <p className="mt-3 text-sm text-gray-500">No hay alérgenos configurados.</p>}
        </section>

        <div className="sticky bottom-0 z-10 flex gap-2 border-t border-gray-200 bg-white/95 p-3 backdrop-blur">
          <button type="button" onClick={() => navigate('/admin/productos')} className="h-11 flex-1 rounded-xl bg-gray-100 px-4 text-sm font-bold text-gray-700">Cancelar</button>
          <button type="submit" disabled={saving} className="inline-flex h-11 flex-[1.5] items-center justify-center gap-2 rounded-xl px-5 text-sm font-bold text-white disabled:opacity-50" style={{ backgroundColor: 'var(--color-primary)' }}><Save size={18} />{saving ? 'Guardando...' : 'Guardar'}</button>
        </div>
      </form>
    </div>
  );
}
