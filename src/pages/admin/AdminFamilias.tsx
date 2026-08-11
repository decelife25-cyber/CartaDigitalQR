import { useEffect, useMemo, useState } from 'react';
import { ArrowLeft, GripVertical, ImageOff, Plus } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { adminApi } from '../../services/adminApi';
import type { Familia } from '../../types/database';
import AppModal from '../../components/ui/AppModal';

function errorMessage(error: unknown): string {
  if (error && typeof error === 'object' && 'message' in error) return String((error as { message: unknown }).message);
  return String(error);
}

export default function AdminFamilias() {
  const navigate = useNavigate();
  const [familias, setFamilias] = useState<Familia[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [createOpen, setCreateOpen] = useState(false);
  const [newName, setNewName] = useState('');
  const [draggedId, setDraggedId] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Familia | null>(null);
  const [modalError, setModalError] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      setFamilias(await adminApi.getFamiliasAdmin());
    } catch (e) {
      setError(errorMessage(e));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { void load(); }, []);

  const ordered = useMemo(() => [...familias].sort((a, b) => a.orden - b.orden), [familias]);

  const create = async () => {
    const nombre = newName.trim();
    if (!nombre) return;
    setSaving(true);
    try {
      const familia = await adminApi.createFamilia({ nombre, orden: familias.length, activo: true });
      if (familia) setFamilias((items) => [...items, familia].sort((a, b) => a.orden - b.orden));
      setNewName('');
      setCreateOpen(false);
    } catch (e) {
      setModalError(errorMessage(e));
    } finally {
      setSaving(false);
    }
  };

  const reorder = async (sourceId: string, targetId: string) => {
    if (sourceId === targetId || saving) return;
    const current = [...ordered];
    const sourceIndex = current.findIndex((item) => item.id === sourceId);
    const targetIndex = current.findIndex((item) => item.id === targetId);
    if (sourceIndex < 0 || targetIndex < 0) return;

    const [moved] = current.splice(sourceIndex, 1);
    current.splice(targetIndex, 0, moved);
    const normalized = current.map((item, index) => ({ ...item, orden: index }));
    setFamilias(normalized);

    setSaving(true);
    try {
      await Promise.all(normalized.map((item) => adminApi.updateFamilia(item.id, { orden: item.orden })));
    } catch (e) {
      setModalError(errorMessage(e));
      await load();
    } finally {
      setSaving(false);
      setDraggedId(null);
    }
  };

  const remove = async () => {
    if (!deleteTarget) return;
    setSaving(true);
    try {
      await adminApi.deleteFamilia(deleteTarget.id);
      setFamilias((items) => items.filter((item) => item.id !== deleteTarget.id));
      setDeleteTarget(null);
    } catch (e) {
      setModalError(errorMessage(e));
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="flex min-h-[60vh] items-center justify-center" style={{ background: 'var(--app-bg)' }}><div className="h-7 w-7 animate-spin rounded-full border-b-2 border-orange-500" /></div>;
  }

  return (
    <div className="min-h-[calc(100dvh-4rem)]" style={{ color: 'var(--app-text)', width: '100vw', maxWidth: '100vw', marginLeft: 'calc(50% - 50vw)', overflowX: 'clip' }}>
      <header className="flex items-center gap-1 border-b px-2 pb-2" style={{ borderColor: 'var(--app-border)' }}>
        <Link to="/admin" className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl" aria-label="Volver al panel privado"><ArrowLeft size={21} /></Link>
        <div className="min-w-0 flex-1"><h1 className="text-[22px] font-extrabold tracking-tight sm:text-3xl">Familias</h1></div>
      </header>

      {error && <div className="mx-2 mt-2 rounded-xl border p-2 text-sm" style={{ borderColor: 'rgba(239,68,68,.25)', background: 'var(--app-surface)', color: '#dc2626' }}>{error}<button type="button" onClick={() => void load()} className="ml-2 font-bold text-orange-600">Reintentar</button></div>}

      <div className="flex items-center justify-between px-2 py-2">
        <p className="text-[15px] font-extrabold">{ordered.length} {ordered.length === 1 ? 'familia' : 'familias'}</p>
        <button type="button" disabled={saving} onClick={() => { setNewName(''); setCreateOpen(true); }} className="inline-flex h-9 shrink-0 items-center gap-1 rounded-xl bg-orange-500 px-2.5 text-sm font-extrabold text-white disabled:opacity-40"><Plus size={17} /><span>Añadir</span></button>
      </div>

      <section className="space-y-1.5" aria-label="Listado de familias">
        {ordered.map((familia) => {
          const dragging = draggedId === familia.id;
          return (
            <article
              key={familia.id}
              draggable={!saving}
              onDragStart={() => setDraggedId(familia.id)}
              onDragOver={(event) => event.preventDefault()}
              onDrop={() => { if (draggedId) void reorder(draggedId, familia.id); }}
              onDragEnd={() => setDraggedId(null)}
              data-family-id={familia.id}
              className={`grid grid-cols-[minmax(0,1fr)_34px] items-stretch overflow-hidden border-y transition-opacity ${dragging ? 'opacity-45' : 'opacity-100'}`}
              style={{ background: 'var(--app-surface)', borderColor: 'var(--app-border)', boxShadow: 'var(--app-shadow)' }}
            >
              <button type="button" onClick={() => navigate(`/admin/familias/${familia.id}/editar`)} className="grid min-w-0 grid-cols-[42px_minmax(0,1fr)_72px] items-center gap-2 py-1.5 pl-2 pr-1 text-left">
                {familia.foto_url ? <img src={familia.foto_url} alt="" className="h-10 w-10 rounded-lg object-cover" /> : <div className="flex h-10 w-10 items-center justify-center rounded-lg" style={{ background: 'rgba(148,163,184,.12)', color: 'var(--app-muted)' }}><ImageOff size={17} /></div>}
                <div className="min-w-0"><div className="break-words text-[15px] font-extrabold leading-[1.15]">{familia.nombre}</div></div>
                <span className={`justify-self-end rounded-full px-2 py-1 text-[10px] font-extrabold ${familia.activo ? 'bg-emerald-500/10 text-emerald-600' : 'bg-black/5 text-zinc-500 dark:bg-white/5 dark:text-zinc-400'}`}>{familia.activo ? 'Visible' : 'Oculta'}</span>
              </button>
              <button type="button" draggable={false} className="flex min-h-[58px] w-[34px] touch-none items-center justify-center" style={{ color: 'var(--app-muted)' }} aria-label={`Arrastrar ${familia.nombre} para cambiar su orden`} title="Arrastra para cambiar el orden"><GripVertical size={18} /></button>
            </article>
          );
        })}

        {!ordered.length && <div className="mx-2 rounded-2xl border border-dashed p-8 text-center" style={{ borderColor: 'var(--app-border)', background: 'var(--app-surface)', color: 'var(--app-muted)' }}><p className="text-sm font-bold">No hay familias creadas.</p><p className="mt-1 text-xs">Pulsa Añadir para crear la primera.</p></div>}
      </section>

      <AppModal open={createOpen} title="Nueva familia" message="Escribe el nombre de la nueva familia." confirmLabel="Añadir" cancelLabel="Cancelar" mobilePosition="top" onCancel={() => { setCreateOpen(false); setNewName(''); }} onConfirm={() => void create()} content={<input autoFocus value={newName} onChange={(event) => setNewName(event.target.value)} onKeyDown={(event) => { if (event.key === 'Enter') void create(); }} placeholder="Nombre de la familia..." aria-label="Nombre de la nueva familia" className="mt-4 h-11 w-full rounded-xl border bg-transparent px-3 text-sm font-medium outline-none focus:border-orange-500" style={{ borderColor: 'var(--app-border)', color: 'var(--app-text)' }} />} />
      <AppModal open={Boolean(deleteTarget)} title="¿Eliminar familia?" message={deleteTarget ? `Se eliminará «${deleteTarget.nombre}». Esta acción no se puede deshacer.` : ''} confirmLabel="Eliminar" cancelLabel="Cancelar" danger onCancel={() => setDeleteTarget(null)} onConfirm={() => void remove()} />
      <AppModal open={Boolean(modalError)} title="No se ha podido completar" message={modalError ?? ''} confirmLabel="Aceptar" cancelLabel="Cerrar" onCancel={() => setModalError(null)} onConfirm={() => setModalError(null)} />
    </div>
  );
}
