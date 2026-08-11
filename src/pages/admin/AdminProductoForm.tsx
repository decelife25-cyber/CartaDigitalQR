import { useEffect, useState, type FormEvent, type ReactNode } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Check, ChevronDown, Image as ImageIcon, Lightbulb, Save, Star, Trash2, Camera } from 'lucide-react';
import AppModal from '../../components/ui/AppModal';
import { adminApi } from '../../services/adminApi';
import type { Alergeno, Familia, Producto } from '../../types/database';

function errorMessage(error: unknown): string {
  if (error && typeof error === 'object' && 'message' in error) return String((error as { message: unknown }).message);
  return String(error);
}
function normalize(value: string): string { return value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase(); }
function erudusIconPath(nombre: string): string | null {
  const key = normalize(nombre); const base = `${import.meta.env.BASE_URL}icons/alergenos/erudus`;
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
  if (key.includes('altram')) return `${base}/lupin.svg`;
  if (key.includes('molusc')) return `${base}/molluscs.svg`;
  return null;
}
function AlergenoIcon({ alergeno }: { alergeno: Alergeno }) {
  const [failed, setFailed] = useState(false); const path = erudusIconPath(alergeno.nombre);
  if (path && !failed) return <span className="flex h-[30px] w-[30px] shrink-0 items-center justify-center rounded-full"><img src={path} alt="" className="h-[28px] w-[28px] object-contain" onError={() => setFailed(true)} /></span>;
  return <span className="h-[30px] w-[30px] shrink-0 rounded-full border" aria-hidden="true" />;
}
function StatusSwitch({ checked }: { checked: boolean }) {
  return <span className={`flex h-5 w-9 items-center rounded-full p-0.5 transition ${checked ? 'justify-end bg-emerald-500' : 'justify-start bg-slate-500/30'}`}><span className="h-4 w-4 rounded-full bg-white shadow-sm" /></span>;
}
function CompactStatus({ label, checked, icon, onChange }: { label: string; checked: boolean; icon?: ReactNode; onChange: (v: boolean) => void }) {
  return <label className="flex cursor-pointer flex-col items-center gap-1 px-1 py-0.5 text-center"><span className={`inline-flex items-center gap-1 text-[9px] font-extrabold uppercase ${checked ? 'text-emerald-500' : ''}`} style={!checked ? { color: 'var(--app-muted)' } : undefined}>{icon}{label}</span><StatusSwitch checked={checked} /><input type="checkbox" checked={checked} onChange={e => onChange(e.target.checked)} className="sr-only" /></label>;
}

type FeedbackModal = { title: string; message: string; danger?: boolean };

type ProductSnapshot = {
  nombre: string;
  descripcion: string;
  precio: string;
  familiaId: string;
  fotoUrl: string;
  activo: boolean;
  agotado: boolean;
  destacado: boolean;
  sugerido: boolean;
  alergenos: string[];
};

function makeSnapshot(values: ProductSnapshot): string {
  return JSON.stringify({ ...values, alergenos: [...values.alergenos].sort() });
}

export default function AdminProductoForm() {
  const { id } = useParams<{ id: string }>(); const navigate = useNavigate(); const isEditing = Boolean(id);
  const [loading,setLoading]=useState(true); const [saving,setSaving]=useState(false); const [familias,setFamilias]=useState<Familia[]>([]); const [alergenos,setAlergenos]=useState<Alergeno[]>([]);
  const [nombre,setNombre]=useState(''); const [descripcion,setDescripcion]=useState(''); const [precio,setPrecio]=useState('0.00'); const [familiaId,setFamiliaId]=useState(''); const [fotoUrl,setFotoUrl]=useState('');
  const [activo,setActivo]=useState(true); const [agotado,setAgotado]=useState(false); const [destacado,setDestacado]=useState(false); const [sugerido,setSugerido]=useState(false); const [familiaOpen,setFamiliaOpen]=useState(false); const [selectedAlergenos,setSelectedAlergenos]=useState<Set<string>>(new Set());
  const [deleteOpen,setDeleteOpen]=useState(false); const [feedback,setFeedback]=useState<FeedbackModal|null>(null); const [unsavedOpen,setUnsavedOpen]=useState(false); const [initialSnapshot,setInitialSnapshot]=useState<string|null>(null);
  const [uploadingFoto, setUploadingFoto] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [deleteFotoOpen, setDeleteFotoOpen] = useState(false);

  useEffect(()=>{const load=async()=>{setLoading(true);try{const [f,a]=await Promise.all([adminApi.getFamiliasAdmin(),adminApi.getAlergenosAdmin()]);setFamilias(f);setAlergenos(a);if(isEditing&&id){const p=await adminApi.getProductoByIdAdmin(id);if(!p){navigate('/admin/productos');return;}const loadedAlergenos=new Set((p.alergenos??[]).map(x=>x.id));setNombre(p.nombre);setDescripcion(p.descripcion??'');setPrecio(Number(p.precio).toFixed(2));setFamiliaId(p.familia_id);setFotoUrl(p.foto_url??'');setActivo(p.activo);setAgotado(p.agotado);setDestacado(p.destacado);setSugerido(p.sugerido??false);setSelectedAlergenos(loadedAlergenos);setInitialSnapshot(makeSnapshot({nombre:p.nombre,descripcion:p.descripcion??'',precio:Number(p.precio).toFixed(2),familiaId:p.familia_id,fotoUrl:p.foto_url??'',activo:p.activo,agotado:p.agotado,destacado:p.destacado,sugerido:p.sugerido??false,alergenos:[...loadedAlergenos]}));}else{const defaultFamiliaId=f[0]?.id??'';setFamiliaId(defaultFamiliaId);setInitialSnapshot(makeSnapshot({nombre:'',descripcion:'',precio:'0.00',familiaId:defaultFamiliaId,fotoUrl:'',activo:true,agotado:false,destacado:false,sugerido:false,alergenos:[]}));}}catch(e){console.error(e);setFeedback({title:'No se pudo cargar',message:errorMessage(e)});}finally{setLoading(false);}};void load();},[id,navigate,isEditing]);

  const currentSnapshot=makeSnapshot({nombre,descripcion,precio,familiaId,fotoUrl,activo,agotado,destacado,sugerido,alergenos:[...selectedAlergenos]});
  const dirty=initialSnapshot!==null&&currentSnapshot!==initialSnapshot;

  useEffect(()=>{const onBeforeUnload=(event:BeforeUnloadEvent)=>{if(!dirty)return;event.preventDefault();event.returnValue='';};window.addEventListener('beforeunload',onBeforeUnload);return()=>window.removeEventListener('beforeunload',onBeforeUnload);},[dirty]);

  const toggleAlergeno = (aid: string) => setSelectedAlergenos((cur) => {
    const n = new Set(cur);
    if (n.has(aid)) {
      n.delete(aid);
    } else {
      n.add(aid);
    }
    return n;
  });
  const normalizePrecio=()=>{const v=Number(precio.replace(',','.'));if(Number.isFinite(v)&&v>=0)setPrecio(v.toFixed(2));};
  const handleDelete=()=>{if(!id||saving)return;setDeleteOpen(true);};
  const handleExit=()=>{if(saving)return;if(dirty)setUnsavedOpen(true);else navigate('/admin/productos');};
  const handleSaveFromModal=()=>{setUnsavedOpen(false);document.getElementById('producto-form')?.requestSubmit();};
  const handleDiscardAndExit=()=>{setUnsavedOpen(false);navigate('/admin/productos');};

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      setFeedback({ title: 'Formato inválido', message: 'Por favor selecciona un archivo de imagen (JPG, PNG, WEBP).' });
      return;
    }

    setUploadingFoto(true);
    try {
      const url = await adminApi.uploadProductoFoto(file);
      setFotoUrl(url);
      setUploadSuccess(true);
      setTimeout(() => setUploadSuccess(false), 2000);
    } catch (err) {
      setFeedback({ title: 'Error al subir', message: errorMessage(err), danger: true });
    } finally {
      setUploadingFoto(false);
      e.target.value = '';
    }
  };

  const confirmDeleteFoto = async () => {
    setDeleteFotoOpen(false);
    if (!fotoUrl) return;
    setSaving(true);
    try {
      await adminApi.deleteProductoFoto(fotoUrl);
      setFotoUrl('');
    } catch (err) {
      setFeedback({ title: 'Error al eliminar', message: errorMessage(err), danger: true });
    } finally {
      setSaving(false);
    }
  };
  const confirmDelete=async()=>{if(!id)return;setDeleteOpen(false);setSaving(true);try{await adminApi.deleteProducto(id);navigate('/admin/productos');}catch(e){setFeedback({title:'No se pudo eliminar',message:errorMessage(e),danger:true});setSaving(false);}};
  const handleSubmit=async(e:FormEvent)=>{e.preventDefault();if(!dirty&&!saving)return;const clean=nombre.trim();const p=Number(precio.replace(',','.'));if(!clean){setFeedback({title:'Falta el nombre',message:'El producto necesita un nombre.'});return;}if(!familiaId){setFeedback({title:'Falta la familia',message:'Debes seleccionar una familia.'});return;}if(!Number.isFinite(p)||p<0){setFeedback({title:'Precio no válido',message:'Introduce un precio válido.'});return;}setSaving(true);try{const data:Partial<Producto>={nombre:clean,descripcion:descripcion.trim()||null,precio:p,familia_id:familiaId,foto_url:fotoUrl.trim()||null,activo,agotado,destacado,sugerido};if(isEditing&&id)await adminApi.updateProducto(id,data,[...selectedAlergenos]);else await adminApi.createProducto(data,[...selectedAlergenos]);navigate('/admin/productos');}catch(e){setFeedback({title:'No se pudo guardar',message:errorMessage(e),danger:true});}finally{setSaving(false);}};
  const familiaNombre=familias.find(f=>f.id===familiaId)?.nombre??'Selecciona una familia';
  if(loading)return <div className="flex min-h-[60vh] items-center justify-center" style={{background:'var(--app-bg)',color:'var(--app-text)'}}><div className="h-7 w-7 animate-spin rounded-full border-b-2 border-orange-500"/></div>;
  return <div className="min-h-[calc(100dvh-4rem)] w-screen max-w-none overflow-x-clip" style={{background:'var(--app-bg)',color:'var(--app-text)',width:'100vw',marginLeft:'calc(50% - 50vw)'}}>
    <header className="sticky top-0 z-30 flex h-11 items-center gap-1 border-b px-2" style={{borderColor:'var(--app-border)',background:'color-mix(in srgb, var(--app-bg) 94%, transparent)',backdropFilter:'blur(10px)'}}>
      <button type="button" onClick={handleExit} className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl" aria-label="Volver"><ArrowLeft size={20}/></button>
      <h1 className="min-w-0 flex-1 truncate text-[18px] font-extrabold tracking-tight">{isEditing?'Editar artículo':'Nuevo artículo'}</h1>
      {isEditing&&<button type="button" onClick={handleDelete} disabled={saving} className="inline-flex h-8 shrink-0 items-center gap-1 rounded-lg px-2 text-[11px] font-extrabold text-red-500"><Trash2 size={15}/><span className="hidden min-[390px]:inline">Eliminar</span></button>}
      <label className="flex shrink-0 cursor-pointer flex-col items-center justify-center gap-0.5 px-1 text-center"><span className="text-[8px] font-extrabold uppercase leading-none" style={{color:'var(--app-muted)'}}>Visible</span><StatusSwitch checked={activo}/><input type="checkbox" checked={activo} onChange={e=>setActivo(e.target.checked)} className="sr-only"/></label>
    </header>
    <form id="producto-form" onSubmit={handleSubmit} className="w-full space-y-2 px-0 pb-14 pt-2">
      <section className="w-full rounded-xl border p-2.5 shadow-sm" style={{background:'var(--app-surface)',borderColor:'var(--app-border)',boxShadow:'var(--app-shadow)'}}>
        <div className="grid grid-cols-[32%_minmax(0,1fr)] gap-2 max-[430px]:grid-cols-[31%_minmax(0,1fr)] sm:grid-cols-[34%_minmax(0,1fr)]">
          <div className="min-w-0">
            <div className="relative overflow-hidden rounded-lg border" style={{borderColor:'var(--app-border)',background:'var(--app-surface-soft)'}}>
              <div className="aspect-square w-full">
                {fotoUrl ? <img src={fotoUrl} alt="Imagen del artículo" className="h-full w-full object-cover" onError={e=>{e.currentTarget.style.display='none'}}/> : <div className="flex h-full items-center justify-center" style={{color:'var(--app-muted)'}}><ImageIcon size={30}/></div>}
                {uploadingFoto && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/60 text-white backdrop-blur-sm z-10">
                    <div className="h-5 w-5 animate-spin rounded-full border-b-2 border-white mb-2" />
                    <span className="text-[10px] font-bold">Subiendo...</span>
                  </div>
                )}
                {uploadSuccess && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center bg-emerald-500/80 text-white backdrop-blur-sm z-10 transition-opacity">
                    <Check size={24} className="mb-1" />
                    <span className="text-[10px] font-bold">✓ Foto subida</span>
                  </div>
                )}
              </div>
            </div>

            <div className="mt-1.5 flex flex-col gap-1">
              <label className="flex h-7 w-full cursor-pointer items-center justify-center gap-1.5 rounded-lg bg-orange-500 px-2 text-[9px] font-bold text-white transition-opacity active:opacity-80">
                <Camera size={13} />
                {fotoUrl ? 'Cambiar foto' : 'Añadir foto'}
                <input type="file" accept="image/jpeg, image/png, image/webp" onChange={handleFileSelect} disabled={uploadingFoto || saving} className="hidden" />
              </label>
              {fotoUrl && (
                <button type="button" onClick={() => setDeleteFotoOpen(true)} disabled={uploadingFoto || saving} className="flex h-7 w-full items-center justify-center rounded-lg border bg-transparent text-[9px] font-bold text-red-500" style={{borderColor:'var(--app-border)'}}>
                  Eliminar foto
                </button>
              )}
            </div>
          </div>
          <div className="min-w-0 space-y-1.5"><label className="block"><span className="mb-0.5 block text-[9px] font-semibold uppercase" style={{color:'var(--app-muted)'}}>Nombre del artículo *</span><input required value={nombre} onChange={e=>setNombre(e.target.value)} maxLength={100} className="h-9 w-full rounded-lg border bg-transparent px-2.5 text-[14px] font-semibold outline-none" style={{borderColor:'var(--app-border)',color:'var(--app-text)'}}/></label><label className="block"><span className="mb-0.5 block text-[9px] font-semibold uppercase" style={{color:'var(--app-muted)'}}>Descripción</span><textarea value={descripcion} onChange={e=>setDescripcion(e.target.value)} rows={4} maxLength={250} className="w-full resize-none rounded-lg border bg-transparent px-2.5 py-1.5 text-[11px] leading-4 outline-none" style={{borderColor:'var(--app-border)',color:'var(--app-text)'}}/></label></div>
        </div>
        <div className="mt-2 grid grid-cols-[minmax(0,1.25fr)_minmax(0,.75fr)] gap-2">
          <div className="relative min-w-0"><span className="mb-0.5 block text-[9px] font-semibold uppercase" style={{color:'var(--app-muted)'}}>Categoría (familia) *</span><button type="button" aria-haspopup="listbox" aria-expanded={familiaOpen} onClick={()=>setFamiliaOpen(v=>!v)} className="flex h-9 w-full items-center justify-between rounded-lg border bg-transparent px-2 text-left text-[11px]" style={{borderColor:familiaOpen?'#10b981':'var(--app-border)',color:'var(--app-text)'}}><span className="truncate">{familiaNombre}</span><ChevronDown size={16} className={familiaOpen?'rotate-180 text-emerald-500':''}/></button>{familiaOpen&&<div className="absolute left-0 right-0 top-[50px] z-40 max-h-64 overflow-y-auto rounded-xl border p-1 shadow-2xl" role="listbox" style={{background:'var(--app-surface)',borderColor:'var(--app-border)'}}>{<button type="button" className={`flex w-full items-center justify-between rounded-lg px-3 py-2.5 text-left text-[11px] ${!familiaId?'bg-emerald-500/10 text-emerald-500':''}`} onClick={()=>{setFamiliaId('');setFamiliaOpen(false);}}>Selecciona una familia{!familiaId&&<Check size={15}/>}</button>}{familias.map(f=><button type="button" key={f.id} role="option" aria-selected={f.id===familiaId} onClick={()=>{setFamiliaId(f.id);setFamiliaOpen(false);}} className={`flex w-full items-center justify-between rounded-lg px-3 py-2.5 text-left text-[11px] ${f.id===familiaId?'bg-emerald-500/10 font-bold text-emerald-500':''}`}>{f.nombre}{f.id===familiaId&&<Check size={15}/>}</button>)}</div>}</div>
          <label className="block min-w-0"><span className="mb-0.5 block text-[9px] font-semibold uppercase" style={{color:'var(--app-muted)'}}>Precio *</span><div className="relative"><input inputMode="decimal" required value={precio} onChange={e=>setPrecio(e.target.value)} onBlur={normalizePrecio} className="h-9 w-full rounded-lg border bg-transparent px-2 pr-7 text-[12px] font-semibold" style={{borderColor:'var(--app-border)',color:'var(--app-text)'}}/><span className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-[10px]" style={{color:'var(--app-muted)'}}>€</span></div></label>
        </div>
        <div className="mt-2 grid grid-cols-3 gap-1.5 border-t pt-2" style={{borderColor:'var(--app-border)'}}><CompactStatus label="Disponible" checked={!agotado} onChange={v=>setAgotado(!v)}/><CompactStatus label="Destacado" checked={destacado} icon={<Star size={11}/>} onChange={setDestacado}/><CompactStatus label="Sugerencia" checked={sugerido} icon={<Lightbulb size={11}/>} onChange={setSugerido}/></div>
      </section>
      <section className="w-full rounded-xl border p-2.5 shadow-sm" style={{background:'var(--app-surface)',borderColor:'var(--app-border)',boxShadow:'var(--app-shadow)'}}><div className="mb-1.5 flex items-end justify-between"><div><h2 className="text-[15px] font-extrabold">Alérgenos</h2><p className="text-[9px]" style={{color:'var(--app-muted)'}}>Selecciona los alérgenos que contiene este artículo.</p></div><span className="rounded-full px-2 py-0.5 text-[10px] font-bold text-orange-500" style={{background:'var(--app-surface-soft)'}}>{selectedAlergenos.size}</span></div><div className="grid grid-cols-2 gap-1">{alergenos.map(a=>{const selected=selectedAlergenos.has(a.id);return <label key={a.id} title={a.nombre} className="flex min-h-8 cursor-pointer items-center gap-1.5 rounded-lg border px-1.5 transition" style={{borderColor:selected?'rgba(249,115,22,.85)':'var(--app-border)',background:selected?'rgba(249,115,22,.10)':'var(--app-surface-soft)'}}><input type="checkbox" checked={selected} onChange={()=>toggleAlergeno(a.id)} className="sr-only"/><span className="flex h-4 w-4 shrink-0 items-center justify-center rounded-sm border" style={selected?{borderColor:'#f97316',background:'#f97316',color:'#fff'}:{borderColor:'var(--app-muted)',color:'transparent'}}><Check size={11} strokeWidth={3}/></span><AlergenoIcon alergeno={a}/><span className="min-w-0 break-words text-[10px] font-semibold leading-[1.05]" style={{color:'var(--app-text)'}}>{a.nombre}</span></label>})}</div></section>
      <div className="sticky bottom-0 z-20 w-full border-t px-2 py-2 backdrop-blur" style={{borderColor:'var(--app-border)',background:'color-mix(in srgb, var(--app-bg) 94%, transparent)'}}><div className="flex w-full gap-2"><button type="button" onClick={handleExit} className="h-9 flex-1 rounded-lg border text-xs font-bold" style={{borderColor:'var(--app-border)',background:'var(--app-surface)',color:'var(--app-muted)'}}>Cancelar</button><button type="submit" disabled={saving||!dirty} className="h-9 flex-[1.7] rounded-lg bg-orange-500 text-xs font-extrabold text-white shadow-sm disabled:cursor-not-allowed disabled:bg-slate-300 disabled:text-slate-500 disabled:shadow-none dark:disabled:bg-slate-700 dark:disabled:text-slate-400"><span className="inline-flex items-center justify-center gap-1.5"><Save size={15}/>{saving?'Guardando…':'Guardar cambios'}</span></button></div></div>
    </form>

    <AppModal open={deleteOpen} title="Eliminar artículo" message={`¿Eliminar «${nombre}»? Esta acción no se puede deshacer.`} confirmLabel="Eliminar" cancelLabel="Cancelar" danger onConfirm={() => void confirmDelete()} onCancel={() => setDeleteOpen(false)} />
    <AppModal open={deleteFotoOpen} title="Eliminar foto" message={`¿Deseas eliminar la fotografía de este producto?`} confirmLabel="Eliminar" cancelLabel="Cancelar" danger onConfirm={() => void confirmDeleteFoto()} onCancel={() => setDeleteFotoOpen(false)} />
    <AppModal open={Boolean(feedback)} title={feedback?.title ?? ''} message={feedback?.message ?? ''} confirmLabel="Aceptar" cancelLabel="Cerrar" danger={feedback?.danger} onConfirm={() => setFeedback(null)} onCancel={() => setFeedback(null)} />
    <AppModal open={unsavedOpen} title="Cambios sin guardar" message="Has modificado este artículo. ¿Qué quieres hacer antes de salir?" confirmLabel="Guardar cambios" cancelLabel="Seguir editando" onConfirm={handleSaveFromModal} onCancel={() => setUnsavedOpen(false)} content={<div className="mt-3"><button type="button" onClick={handleDiscardAndExit} className="h-11 w-full rounded-xl border text-sm font-extrabold text-red-500" style={{borderColor:'rgba(239,68,68,.25)',background:'rgba(239,68,68,.06)'}}>Salir sin guardar</button></div>} />
  </div>;
}