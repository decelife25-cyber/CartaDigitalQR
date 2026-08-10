import { useEffect, useMemo, useState } from 'react';
import { ArrowLeft, Edit, GripVertical, Plus, Save, Trash2, X } from 'lucide-react';
import { Link } from 'react-router-dom';
import { adminApi } from '../../services/adminApi';
import type { Familia } from '../../types/database';

function errorMessage(error: unknown): string {
  if (error && typeof error === 'object' && 'message' in error) return String((error as { message: unknown }).message);
  return String(error);
}

export default function AdminFamilias() {
  const [familias, setFamilias] = useState<Familia[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draftName, setDraftName] = useState('');
  const [newName, setNewName] = useState('');

  const load = async () => {
    setLoading(true); setError(null);
    try { setFamilias(await adminApi.getFamiliasAdmin()); }
    catch (e) { setError(errorMessage(e)); }
    finally { setLoading(false); }
  };

  useEffect(() => { void load(); }, []);

  const ordered = useMemo(() => [...familias].sort((a, b) => a.orden - b.orden), [familias]);

  const startEdit = (familia: Familia) => { setEditingId(familia.id); setDraftName(familia.nombre); };
  const cancelEdit = () => { setEditingId(null); setDraftName(''); };

  const saveEdit = async (familia: Familia) => {
    const nombre = draftName.trim();
    if (!nombre) return;
    setSaving(true);
    try {
      await adminApi.updateFamilia(familia.id, { nombre });
      setFamilias((items) => items.map((item) => item.id === familia.id ? { ...item, nombre } : item));
      cancelEdit();
    } catch (e) { alert(errorMessage(e)); }
    finally { setSaving(false); }
  };

  const create = async () => {
    const nombre = newName.trim();
    if (!nombre) return;
    setSaving(true);
    try {
      const familia = await adminApi.createFamilia({ nombre, orden: familias.length, activo: true });
      if (familia) {
        setFamilias((items) => [...items, familia].sort((a, b) => a.orden - b.orden));
      }
      setNewName('');
    } catch (e) { alert(errorMessage(e)); }
    finally { setSaving(false); }
  };

  const remove = async (familia: Familia) => {
    if (!window.confirm(`¿Eliminar «${familia.nombre}»?`)) return;
    setSaving(true);
    try { await adminApi.deleteFamilia(familia.id); setFamilias((items) => items.filter((item) => item.id !== familia.id)); }
    catch (e) { alert(errorMessage(e)); }
    finally { setSaving(false); }
  };

  const toggleActive = async (familia: Familia) => {
    setSaving(true);
    try {
      const activo = !familia.activo;
      await adminApi.updateFamilia(familia.id, { activo });
      setFamilias((items) => items.map((item) => item.id === familia.id ? { ...item, activo } : item));
    } catch (e) { alert(errorMessage(e)); }
    finally { setSaving(false); }
  };

  if (loading) return <div className="flex min-h-[60vh] items-center justify-center bg-[#111111]"><div className="h-7 w-7 animate-spin rounded-full border-b-2 border-orange-400" /></div>;

  return (
    <div className="mx-auto min-h-[calc(100dvh-1rem)] w-full max-w-3xl bg-[#111111] px-2 pb-4 text-white sm:px-3">
      <header className="sticky top-0 z-30 flex h-12 items-center gap-2 border-b border-white/10 bg-[#111111]/95 backdrop-blur">
        <Link to="/admin" className="flex h-9 w-9 items-center justify-center rounded-lg text-white/75 hover:bg-white/5" aria-label="Volver al inicio"><ArrowLeft size={19} /></Link>
        <div className="min-w-0"><h1 className="text-lg font-extrabold">Familias</h1><p className="text-[9px] font-semibold uppercase tracking-wide text-white/35">Organiza las categorías de la carta</p></div>
      </header>

      {error && <div className="mt-2 rounded-xl border border-red-400/20 bg-[#171717] p-3 text-xs text-red-300">{error}<button type="button" onClick={() => void load()} className="ml-2 font-bold text-orange-300">Reintentar</button></div>}

      <section className="mt-2 rounded-xl border border-white/10 bg-[#171717] p-2.5">
        <div className="flex gap-2">
          <input value={newName} onChange={(e) => setNewName(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter') void create(); }} placeholder="Nueva familia..." className="h-9 min-w-0 flex-1 rounded-md border border-white/10 bg-[#202020] px-2.5 text-xs text-white outline-none placeholder:text-white/30 focus:border-orange-400/60" />
          <button type="button" disabled={saving || !newName.trim()} onClick={() => void create()} className="inline-flex h-9 shrink-0 items-center gap-1 rounded-md bg-orange-400 px-3 text-xs font-extrabold text-[#111] disabled:opacity-40"><Plus size={15} /> Añadir</button>
        </div>
      </section>

      <div className="flex items-center justify-between px-1 py-2 text-[10px] font-semibold text-white/35"><span>{ordered.length} familia{ordered.length === 1 ? '' : 's'}</span><span>Orden de carta</span></div>

      <section className="space-y-1.5">
        {ordered.map((familia) => {
          const editing = editingId === familia.id;
          return <article key={familia.id} className="rounded-xl border border-white/10 bg-[#171717] p-2.5">
            <div className="flex items-center gap-2">
              <GripVertical size={17} className="shrink-0 text-white/20" />
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-[#202020] text-xs font-extrabold text-orange-300">{familia.orden + 1}</div>
              {editing ? <input autoFocus value={draftName} onChange={(e) => setDraftName(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter') void saveEdit(familia); if (e.key === 'Escape') cancelEdit(); }} className="h-9 min-w-0 flex-1 rounded-md border border-orange-400/50 bg-[#202020] px-2.5 text-sm font-bold text-white outline-none" /> : <div className="min-w-0 flex-1"><div className="truncate text-sm font-extrabold">{familia.nombre}</div><div className={`text-[9px] font-semibold ${familia.activo ? 'text-green-300/70' : 'text-white/30'}`}>{familia.activo ? 'Visible en la carta' : 'Oculta en la carta'}</div></div>}
              {editing ? <><button type="button" disabled={saving} onClick={() => void saveEdit(familia)} className="flex h-8 w-8 items-center justify-center rounded-md bg-orange-400 text-[#111]" aria-label="Guardar"><Save size={15} /></button><button type="button" onClick={cancelEdit} className="flex h-8 w-8 items-center justify-center rounded-md text-white/45" aria-label="Cancelar"><X size={16} /></button></> : <><button type="button" disabled={saving} onClick={() => void toggleActive(familia)} className={`h-7 rounded-md px-2 text-[10px] font-bold ${familia.activo ? 'bg-green-400/10 text-green-300' : 'bg-white/5 text-white/40'}`}>{familia.activo ? 'Visible' : 'Oculta'}</button><button type="button" onClick={() => startEdit(familia)} className="flex h-8 w-8 items-center justify-center rounded-md text-white/45 hover:bg-white/5" aria-label="Editar"><Edit size={15} /></button><button type="button" disabled={saving} onClick={() => void remove(familia)} className="flex h-8 w-8 items-center justify-center rounded-md text-white/30 hover:bg-red-400/10 hover:text-red-300" aria-label="Eliminar"><Trash2 size={15} /></button></>}
            </div>
          </article>;
        })}
        {!ordered.length && <div className="rounded-xl border border-dashed border-white/15 bg-[#171717] px-5 py-12 text-center text-sm font-bold text-white/45">No hay familias creadas.</div>}
      </section>
    </div>
  );
}
