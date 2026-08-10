import { useEffect, useMemo, useState } from 'react';
import { ArrowLeft, Edit, GripVertical, Plus, Save, Trash2, X } from 'lucide-react';
import { Link } from 'react-router-dom';
import { adminApi } from '../../services/adminApi';
import type { Familia } from '../../types/database';
import AppModal from '../../components/ui/AppModal';

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
  const [createOpen, setCreateOpen] = useState(false);
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

  const startEdit = (familia: Familia) => {
    setEditingId(familia.id);
    setDraftName(familia.nombre);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setDraftName('');
  };

  const saveEdit = async (familia: Familia) => {
    const nombre = draftName.trim();
    if (!nombre) return;
    setSaving(true);
    try {
      await adminApi.updateFamilia(familia.id, { nombre });
      setFamilias((items) => items.map((item) => item.id === familia.id ? { ...item, nombre } : item));
      cancelEdit();
    } catch (e) {
      setModalError(errorMessage(e));
    } finally {
      setSaving(false);
    }
  };

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

  const remove = async (familia: Familia) => {
    setDeleteTarget(null);
    setSaving(true);
    try {
      await adminApi.deleteFamilia(familia.id);
      setFamilias((items) => items.filter((item) => item.id !== familia.id));
    } catch (e) {
      setModalError(errorMessage(e));
    } finally {
      setSaving(false);
    }
  };

  const toggleActive = async (familia: Familia) => {
    setSaving(true);
    try {
      const activo = !familia.activo;
      await adminApi.updateFamilia(familia.id, { activo });
      setFamilias((items) => items.map((item) => item.id === familia.id ? { ...item, activo } : item));
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
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl transition-colors hover:bg-black/5 dark:hover:bg-white/5"
          aria-label="Volver al panel privado"
        >
          <ArrowLeft size={21} />
        </Link>
        <div className="min-w-0">
          <h1 className="text-[22px] font-extrabold tracking-tight sm:text-3xl">Familias</h1>
        </div>
      </header>

      {error && (
        <div className="mt-2 rounded-xl border p-2 text-sm" style={{ borderColor: 'rgba(239,68,68,.25)', background: 'var(--app-surface)', color: '#dc2626' }}>
          {error}
          <button type="button" onClick={() => void load()} className="ml-2 font-bold text-orange-600">Reintentar</button>
        </div>
      )}

      <div className="flex items-center justify-between px-1 py-2">
        <p className="text-[15px] font-extrabold">{ordered.length} {ordered.length === 1 ? 'familia' : 'familias'}</p>
        <button
          type="button"
          disabled={saving}
          onClick={() => { setNewName(''); setCreateOpen(true); }}
          className="inline-flex h-9 shrink-0 items-center gap-1 rounded-xl bg-orange-500 px-2.5 text-sm font-extrabold text-white transition-opacity disabled:cursor-not-allowed disabled:opacity-40"
        >
          <Plus size={17} />
          <span>Añadir</span>
        </button>
      </div>

      <section className="space-y-1">
        {ordered.map((familia) => {
          const editing = editingId === familia.id;
          return (
            <article
              key={familia.id}
              draggable={!editing && !saving}
              onDragStart={() => setDraggedId(familia.id)}
              onDragOver={(e) => e.preventDefault()}
              onDrop={() => { if (draggedId) void reorder(draggedId, familia.id); }}
              onDragEnd={() => setDraggedId(null)}
              className={`rounded-2xl border px-1.5 py-1 transition-opacity ${draggedId === familia.id ? 'opacity-50' : 'opacity-100'}`}
              style={{ background: 'var(--app-surface)', borderColor: 'var(--app-border)', boxShadow: 'var(--app-shadow)' }}
            >
              <div className="flex min-w-0 items-center gap-0.5">
                <button
                  type="button"
                  className="flex h-9 w-6 shrink-0 cursor-grab items-center justify-center rounded-lg active:cursor-grabbing"
                  style={{ color: 'var(--app-muted)' }}
                  aria-label={`Arrastrar ${familia.nombre} para cambiar su orden`}
                  title="Arrastra para cambiar el orden"
                >
                  <GripVertical size={17} />
                </button>

                {editing ? (
                  <input
                    autoFocus
                    value={draftName}
                    onChange={(e) => setDraftName(e.target.value)}
                    onKeyDown={(e) => { if (e.key === 'Enter') void saveEdit(familia); if (e.key === 'Escape') cancelEdit(); }}
                    className="h-9 min-w-0 flex-1 rounded-xl border bg-transparent px-2 text-[15px] font-bold outline-none focus:border-orange-500"
                    style={{ borderColor: 'rgba(249,115,22,.55)', color: 'var(--app-text)' }}
                    aria-label="Nombre de la familia"
                  />
                ) : (
                  <div className="min-w-0 flex-1 pr-0.5">
                    <div className="break-words text-[15px] font-extrabold leading-tight sm:text-base">{familia.nombre}</div>
                  </div>
                )}

                {editing ? (
                  <div className="flex shrink-0 items-center gap-0">
                    <button type="button" disabled={saving || !draftName.trim()} onClick={() => void saveEdit(familia)} className="flex h-8 w-8 items-center justify-center rounded-xl bg-orange-500 text-white disabled:opacity-40" aria-label="Guardar cambios">
                      <Save size={17} />
                    </button>
                    <button type="button" onClick={cancelEdit} className="flex h-8 w-8 items-center justify-center rounded-xl" style={{ color: 'var(--app-muted)' }} aria-label="Cancelar edición">
                      <X size={18} />
                    </button>
                  </div>
                ) : (
                  <div className="flex shrink-0 items-center gap-0">
                    <button
                      type="button"
                      disabled={saving}
                      onClick={() => void toggleActive(familia)}
                      className={`min-w-[55px] rounded-lg px-1 py-1.5 text-[10px] font-extrabold transition-opacity disabled:opacity-40 ${familia.activo ? 'bg-emerald-500/10 text-emerald-600' : 'bg-black/5 text-zinc-500 dark:bg-white/5 dark:text-zinc-400'}`}
                      aria-label={familia.activo ? `Ocultar ${familia.nombre}` : `Mostrar ${familia.nombre}`}
                    >
                      {familia.activo ? 'Visible' : 'Oculta'}
                    </button>
                    <button type="button" onClick={() => startEdit(familia)} className="flex h-8 w-8 items-center justify-center rounded-xl" style={{ color: 'var(--app-muted)' }} aria-label={`Editar ${familia.nombre}`}>
                      <Edit size={17} />
                    </button>
                    <button type="button" disabled={saving} onClick={() => setDeleteTarget(familia)} className="flex h-8 w-8 items-center justify-center rounded-xl text-zinc-400 hover:text-red-500 disabled:opacity-40" aria-label={`Eliminar ${familia.nombre}`}>
                      <Trash2 size={17} />
                    </button>
                  </div>
                )}
              </div>
            </article>
          );
        })}

        {!ordered.length && (
          <div className="rounded-2xl border border-dashed p-8 text-center" style={{ borderColor: 'var(--app-border)', background: 'var(--app-surface)', color: 'var(--app-muted)' }}>
            <p className="text-sm font-bold">No hay familias creadas.</p>
            <p className="mt-1 text-xs">Pulsa Añadir para crear la primera.</p>
          </div>
        )}
      </section>

      <AppModal
        open={createOpen}
        title="Nueva familia"
        message="Escribe el nombre de la nueva familia."
        confirmLabel="Añadir"
        cancelLabel="Cancelar"
        onCancel={() => { setCreateOpen(false); setNewName(''); }}
        onConfirm={() => void create()}
        content={(
          <input
            autoFocus
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') void create(); }}
            placeholder="Nombre de la familia..."
            aria-label="Nombre de la nueva familia"
            className="mt-4 h-11 w-full rounded-xl border bg-transparent px-3 text-sm font-medium outline-none focus:border-orange-500"
            style={{ borderColor: 'var(--app-border)', color: 'var(--app-text)' }}
          />
        )}
      />

      <AppModal
        open={Boolean(deleteTarget)}
        title="¿Eliminar familia?"
        message={deleteTarget ? `Se eliminará «${deleteTarget.nombre}». Esta acción no se puede deshacer.` : ''}
        confirmLabel="Eliminar"
        cancelLabel="Cancelar"
        danger
        onCancel={() => setDeleteTarget(null)}
        onConfirm={() => { if (deleteTarget) void remove(deleteTarget); }}
      />

      <AppModal
        open={Boolean(modalError)}
        title="No se ha podido completar"
        message={modalError ?? ''}
        confirmLabel="Aceptar"
        cancelLabel="Cerrar"
        onCancel={() => setModalError(null)}
        onConfirm={() => setModalError(null)}
      />
    </div>
  );
}
