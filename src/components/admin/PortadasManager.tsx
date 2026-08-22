import { useEffect, useMemo, useRef, useState } from 'react';
import { CalendarClock, CheckCircle2, ImagePlus, Pencil, Plus, Trash2, X } from 'lucide-react';
import { supabase } from '../../lib/supabase';

type Portada = {
  id: string;
  configuracion_id: string;
  nombre: string;
  image_url: string;
  storage_path: string | null;
  activa: boolean;
  programada_desde: string | null;
  programada_hasta: string | null;
  created_at: string;
  updated_at: string;
};

type Props = {
  configuracionId: string;
  portadaActual: string | null;
  onPortadaActualChange: (url: string) => void;
};

const MAX_PORTADAS = 10;
const MAX_SIZE = 10 * 1024 * 1024;
const TYPES = new Set(['image/jpeg', 'image/png', 'image/webp']);

function errorMessage(error: unknown): string {
  if (error instanceof Error) return error.message;
  if (error && typeof error === 'object' && 'message' in error && typeof error.message === 'string') return error.message;
  return 'No se pudo completar la operación.';
}

function toLocalInput(value: string | null) {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

function fromLocalInput(value: string) {
  return value ? new Date(value).toISOString() : null;
}

function storagePathFromPublicUrl(url: string | null): string | null {
  if (!url) return null;
  const marker = '/storage/v1/object/public/productos/';
  const index = url.indexOf(marker);
  if (index < 0) return null;
  return decodeURIComponent(url.slice(index + marker.length).split('?')[0]);
}

function isScheduledNow(portada: Portada, now: number) {
  const from = portada.programada_desde ? new Date(portada.programada_desde).getTime() : null;
  const until = portada.programada_hasta ? new Date(portada.programada_hasta).getTime() : null;
  return (from === null || now >= from) && (until === null || now <= until) && (from !== null || until !== null);
}

export default function PortadasManager({ configuracionId, portadaActual, onPortadaActualChange }: Props) {
  const [portadas, setPortadas] = useState<Portada[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [now, setNow] = useState(() => Date.now());
  const [editingId, setEditingId] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [from, setFrom] = useState('');
  const [until, setUntil] = useState('');
  const inputRef = useRef<HTMLInputElement | null>(null);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const { data, error: queryError } = await supabase
        .from('portadas_carta')
        .select('*')
        .eq('configuracion_id', configuracionId)
        .order('created_at', { ascending: true });
      if (queryError) throw queryError;
      setPortadas((data ?? []) as Portada[]);
    } catch (e) {
      setError(errorMessage(e));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { void load(); }, [configuracionId]);
  useEffect(() => {
    const timer = window.setInterval(() => setNow(Date.now()), 60_000);
    return () => window.clearInterval(timer);
  }, []);

  const scheduled = useMemo(() => portadas
    .filter((item) => isScheduledNow(item, now))
    .sort((a, b) => new Date(b.programada_desde ?? b.created_at).getTime() - new Date(a.programada_desde ?? a.created_at).getTime()), [portadas, now]);
  const effective = scheduled[0] ?? portadas.find((item) => item.activa) ?? null;

  const activate = async (id: string) => {
    const selected = portadas.find((item) => item.id === id);
    if (!selected) return;
    setBusy(true); setError(null);
    try {
      const { error: clearError } = await supabase.from('portadas_carta').update({ activa: false, updated_at: new Date().toISOString() }).eq('configuracion_id', configuracionId);
      if (clearError) throw clearError;
      const { error: activateError } = await supabase.from('portadas_carta').update({ activa: true, updated_at: new Date().toISOString() }).eq('id', id);
      if (activateError) throw activateError;
      const { error: configError } = await supabase.from('configuracion_restaurante').update({ portada_url: selected.image_url, updated_at: new Date().toISOString() }).eq('id', configuracionId);
      if (configError) throw configError;
      onPortadaActualChange(selected.image_url);
      await load();
    } catch (e) {
      setError(errorMessage(e));
      await load();
    } finally { setBusy(false); }
  };

  const upload = async (file: File) => {
    if (portadas.length >= MAX_PORTADAS) {
      setError('Has alcanzado el límite de 10 portadas. Elimina una para guardar otra.');
      return;
    }
    if (!TYPES.has(file.type)) { setError('La portada debe ser JPG, PNG o WebP.'); return; }
    if (file.size > MAX_SIZE) { setError('La portada no puede superar los 10 MB.'); return; }
    setBusy(true); setError(null);
    try {
      const extension = file.type === 'image/jpeg' ? 'jpg' : file.type === 'image/webp' ? 'webp' : 'png';
      const path = `portadas/${crypto.randomUUID()}.${extension}`;
      const { error: uploadError } = await supabase.storage.from('productos').upload(path, file, { cacheControl: '31536000', contentType: file.type, upsert: false });
      if (uploadError) throw uploadError;
      const { data: publicData } = supabase.storage.from('productos').getPublicUrl(path);
      const makeActive = portadas.length === 0;
      const { error: insertError } = await supabase.from('portadas_carta').insert({ configuracion_id: configuracionId, nombre: file.name.replace(/\.[^.]+$/, '') || 'Nueva portada', image_url: publicData.publicUrl, storage_path: path, activa: makeActive });
      if (insertError) {
        await supabase.storage.from('productos').remove([path]);
        throw insertError;
      }
      if (makeActive) {
        await supabase.from('configuracion_restaurante').update({ portada_url: publicData.publicUrl, updated_at: new Date().toISOString() }).eq('id', configuracionId);
        onPortadaActualChange(publicData.publicUrl);
      }
      await load();
    } catch (e) { setError(errorMessage(e)); }
    finally {
      setBusy(false);
      if (inputRef.current) inputRef.current.value = '';
    }
  };

  const remove = async (item: Portada) => {
    if (effective?.id === item.id) {
      setError('No puedes eliminar la portada que está activa ahora mismo. Activa otra antes de eliminarla.');
      return;
    }
    if (!window.confirm(`¿Eliminar la portada «${item.nombre}»?`)) return;
    setBusy(true); setError(null);
    try {
      const { error: deleteError } = await supabase.from('portadas_carta').delete().eq('id', item.id);
      if (deleteError) throw deleteError;
      const path = item.storage_path || storagePathFromPublicUrl(item.image_url);
      if (path) await supabase.storage.from('productos').remove([path]);
      await load();
    } catch (e) { setError(errorMessage(e)); }
    finally { setBusy(false); }
  };

  const startEdit = (item: Portada) => {
    setEditingId(item.id); setName(item.nombre); setFrom(toLocalInput(item.programada_desde)); setUntil(toLocalInput(item.programada_hasta)); setError(null);
  };

  const saveEdit = async () => {
    if (!editingId || !name.trim()) return;
    if (from && until && new Date(until).getTime() <= new Date(from).getTime()) { setError('La fecha de fin debe ser posterior a la fecha de inicio.'); return; }
    setBusy(true); setError(null);
    try {
      const { error: updateError } = await supabase.from('portadas_carta').update({ nombre: name.trim(), programada_desde: fromLocalInput(from), programada_hasta: fromLocalInput(until), updated_at: new Date().toISOString() }).eq('id', editingId);
      if (updateError) throw updateError;
      setEditingId(null); await load();
    } catch (e) { setError(errorMessage(e)); }
    finally { setBusy(false); }
  };

  return (
    <section className="mt-2 w-full min-w-0 rounded-xl border bg-[var(--app-surface)] p-2.5" style={{ borderColor: 'var(--app-border)' }}>
      <div className="flex items-start justify-between gap-3">
        <div><h2 className="text-sm font-extrabold">Portadas de la carta</h2><p className="mt-0.5 text-[9px] text-[var(--app-muted)]">Guarda hasta 10 portadas y cambia entre ellas sin volver a subirlas.</p></div>
        <span className="shrink-0 rounded-full bg-orange-400/10 px-2 py-0.5 text-[9px] font-bold text-orange-500">{portadas.length}/{MAX_PORTADAS}</span>
      </div>

      {error && <div className="mt-2 rounded-lg border border-red-400/20 bg-red-400/5 p-2 text-[10px] font-semibold text-red-500">{error}</div>}
      {loading ? <div className="flex justify-center py-8 text-xs text-[var(--app-muted)]">Cargando portadas…</div> : (
        <>
          <div className="mt-2 grid gap-2 sm:grid-cols-2">
            {portadas.map((item) => {
              const isEffective = effective?.id === item.id;
              const isDefault = item.activa;
              const hasSchedule = Boolean(item.programada_desde || item.programada_hasta);
              return (
                <article key={item.id} className={`overflow-hidden rounded-xl border ${isEffective ? 'border-orange-400/70 ring-1 ring-orange-400/20' : ''}`} style={{ borderColor: isEffective ? undefined : 'var(--app-border)' }}>
                  <div className="relative bg-black/10"><img src={item.image_url} alt={item.nombre} className="block aspect-[16/9] w-full object-cover" />{isEffective && <span className="absolute left-2 top-2 inline-flex items-center gap-1 rounded-full bg-green-500 px-2 py-1 text-[9px] font-extrabold text-white"><CheckCircle2 size={12} />{hasSchedule ? 'ACTIVA POR FECHA' : 'ACTIVA'}</span>}</div>
                  <div className="p-2">
                    {editingId === item.id ? (
                      <div className="space-y-2">
                        <input value={name} onChange={(e) => setName(e.target.value)} className="h-8 w-full rounded-md border bg-[var(--app-surface-soft)] px-2 text-xs font-bold outline-none" style={{ borderColor: 'var(--app-border)' }} />
                        <label className="block text-[9px] font-bold uppercase tracking-wide text-[var(--app-muted)]">Desde<input type="datetime-local" value={from} onChange={(e) => setFrom(e.target.value)} className="mt-1 h-8 w-full rounded-md border bg-[var(--app-surface-soft)] px-2 text-[10px] text-[var(--app-text)]" style={{ borderColor: 'var(--app-border)' }} /></label>
                        <label className="block text-[9px] font-bold uppercase tracking-wide text-[var(--app-muted)]">Hasta<input type="datetime-local" value={until} onChange={(e) => setUntil(e.target.value)} className="mt-1 h-8 w-full rounded-md border bg-[var(--app-surface-soft)] px-2 text-[10px] text-[var(--app-text)]" style={{ borderColor: 'var(--app-border)' }} /></label>
                        <div className="flex gap-2"><button type="button" onClick={() => void saveEdit()} disabled={busy} className="flex h-8 flex-1 items-center justify-center rounded-md bg-orange-400 text-[10px] font-extrabold text-[#111]">Guardar</button><button type="button" onClick={() => setEditingId(null)} className="flex h-8 w-8 items-center justify-center rounded-md border" style={{ borderColor: 'var(--app-border)' }}><X size={14} /></button></div>
                      </div>
                    ) : (
                      <>
                        <div className="flex items-start justify-between gap-2"><div className="min-w-0"><h3 className="truncate text-xs font-extrabold">{item.nombre}</h3>{hasSchedule && <p className="mt-0.5 flex items-center gap-1 text-[9px] text-[var(--app-muted)]"><CalendarClock size={11} />{toLocalInput(item.programada_desde)?.replace('T', ' ')}{item.programada_hasta ? ` → ${toLocalInput(item.programada_hasta)?.replace('T', ' ')}` : ' → sin fin'}</p>}</div><button type="button" onClick={() => startEdit(item)} className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md text-[var(--app-muted)] hover:bg-black/5 dark:hover:bg-white/5" aria-label={`Editar ${item.nombre}`}><Pencil size={13} /></button></div>
                        <div className="mt-2 flex gap-2"><button type="button" onClick={() => void activate(item.id)} disabled={busy || isDefault} className="flex h-8 flex-1 items-center justify-center rounded-md bg-orange-400 px-2 text-[10px] font-extrabold text-[#111] disabled:opacity-40">{isDefault ? 'Predeterminada' : 'Activar ahora'}</button><button type="button" onClick={() => void remove(item)} disabled={busy || isEffective} className="flex h-8 w-8 items-center justify-center rounded-md border text-red-500 disabled:opacity-30" style={{ borderColor: 'var(--app-border)' }} aria-label={`Eliminar ${item.nombre}`}><Trash2 size={14} /></button></div>
                      </>
                    )}
                  </div>
                </article>
              );
            })}
          </div>
          <div className="mt-2 flex items-center gap-2">
            <input ref={inputRef} type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={(event) => { const file = event.target.files?.[0]; if (file) void upload(file); }} />
            <button type="button" onClick={() => inputRef.current?.click()} disabled={busy || portadas.length >= MAX_PORTADAS} className="flex h-9 flex-1 items-center justify-center gap-1.5 rounded-md bg-orange-400 px-3 text-[10px] font-extrabold text-[#111] disabled:opacity-40"><Plus size={14} />Añadir portada</button>
            <span className="text-[9px] text-[var(--app-muted)]">Máx. 10 MB</span>
          </div>
        </>
      )}
    </section>
  );
}
