import { useEffect, useRef, useState, type FormEvent } from 'react';
import { ArrowLeft, Camera, Check, Image as ImageIcon, Save, Trash2 } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import AppModal from '../../components/ui/AppModal';
import { adminApi } from '../../services/adminApi';
import { familiaApi } from '../../services/familiaApi';
import type { Familia } from '../../types/database';

function errorMessage(error: unknown): string {
  if (error && typeof error === 'object' && 'message' in error) return String((error as { message: unknown }).message);
  return String(error);
}

function StatusSwitch({ checked }: { checked: boolean }) {
  return (
    <span className={`flex h-5 w-9 items-center rounded-full p-0.5 transition ${checked ? 'justify-end bg-emerald-500' : 'justify-start bg-slate-500/30'}`}>
      <span className="h-4 w-4 rounded-full bg-white shadow-sm" />
    </span>
  );
}

type FeedbackModal = { title: string; message: string; danger?: boolean };

export default function AdminFamiliaForm() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isEditing = Boolean(id);
  const [familia, setFamilia] = useState<Familia | null>(null);
  const [nombre, setNombre] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [fotoUrl, setFotoUrl] = useState('');
  const [activo, setActivo] = useState(true);
  const [loading, setLoading] = useState(isEditing);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [feedback, setFeedback] = useState<FeedbackModal | null>(null);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteFotoOpen, setDeleteFotoOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (!isEditing || !id) return;

    const load = async () => {
      setLoading(true);
      try {
        const data = await adminApi.getFamiliasAdmin();
        const item = data.find((entry) => entry.id === id);
        if (!item) {
          navigate('/admin/familias', { replace: true });
          return;
        }
        setFamilia(item);
        setNombre(item.nombre);
        setDescripcion(item.descripcion ?? '');
        setFotoUrl(item.foto_url ?? '');
        setActivo(item.activo);
      } catch (error) {
        setFeedback({ title: 'No se pudo cargar', message: errorMessage(error), danger: true });
      } finally {
        setLoading(false);
      }
    };

    void load();
  }, [id, isEditing, navigate]);

  const handleFile = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      setFeedback({ title: 'Formato inválido', message: 'Selecciona una imagen JPG, PNG o WEBP.' });
      return;
    }

    setUploading(true);
    try {
      const url = await familiaApi.uploadFoto(file);
      setFotoUrl(url);
      setUploadSuccess(true);
      window.setTimeout(() => setUploadSuccess(false), 1800);
    } catch (error) {
      setFeedback({ title: 'Error al subir', message: errorMessage(error), danger: true });
    } finally {
      setUploading(false);
    }
  };

  const confirmDeleteFoto = async () => {
    setDeleteFotoOpen(false);
    if (!fotoUrl) return;
    setSaving(true);
    try {
      await familiaApi.deleteFoto(fotoUrl);
      setFotoUrl('');
    } catch (error) {
      setFeedback({ title: 'Error al eliminar', message: errorMessage(error), danger: true });
    } finally {
      setSaving(false);
    }
  };

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    const cleanName = nombre.trim();
    if (!cleanName) {
      setFeedback({ title: 'Falta el nombre', message: 'La familia necesita un nombre.' });
      return;
    }

    setSaving(true);
    try {
      const fields: Partial<Familia> = {
        nombre: cleanName,
        descripcion: descripcion.trim() || null,
        foto_url: fotoUrl.trim() || null,
        activo,
      };

      if (isEditing && familia) {
        await adminApi.updateFamilia(familia.id, fields);
      } else {
        const created = await adminApi.createFamilia(fields);
        if (!created) throw new Error('No se pudo crear la familia.');
      }

      navigate('/admin/familias');
    } catch (error) {
      setFeedback({ title: 'No se pudo guardar', message: errorMessage(error), danger: true });
    } finally {
      setSaving(false);
    }
  };

  const confirmDelete = async () => {
    if (!familia) return;
    setDeleteOpen(false);
    setSaving(true);
    try {
      await adminApi.deleteFamilia(familia.id);
      navigate('/admin/familias', { replace: true });
    } catch (error) {
      setFeedback({ title: 'No se pudo eliminar', message: errorMessage(error), danger: true });
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="flex min-h-[60vh] items-center justify-center" style={{ background: 'var(--app-bg)' }}><div className="h-7 w-7 animate-spin rounded-full border-b-2 border-orange-500" /></div>;
  }

  return (
    <div className="min-h-[calc(100dvh-4rem)] w-screen max-w-none overflow-x-clip" style={{ background: 'var(--app-bg)', color: 'var(--app-text)', width: '100vw', marginLeft: 'calc(50% - 50vw)' }}>
      <header className="sticky top-0 z-30 flex h-11 items-center gap-1 border-b px-2" style={{ borderColor: 'var(--app-border)', background: 'color-mix(in srgb, var(--app-bg) 94%, transparent)', backdropFilter: 'blur(10px)' }}>
        <button type="button" onClick={() => navigate('/admin/familias')} className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl" aria-label="Volver"><ArrowLeft size={20} /></button>
        <h1 className="min-w-0 flex-1 truncate text-[18px] font-extrabold tracking-tight">{isEditing ? 'Editar familia' : 'Nueva familia'}</h1>
        {isEditing && <button type="button" onClick={() => setDeleteOpen(true)} disabled={saving || uploading} className="inline-flex h-8 shrink-0 items-center gap-1 rounded-lg px-2 text-[11px] font-extrabold text-red-500 disabled:opacity-40"><Trash2 size={15} /><span className="hidden min-[390px]:inline">Eliminar</span></button>}
        <label className="flex shrink-0 cursor-pointer flex-col items-center justify-center gap-0.5 px-1 text-center">
          <span className="text-[8px] font-extrabold uppercase leading-none" style={{ color: 'var(--app-muted)' }}>{activo ? 'Visible' : 'Oculta'}</span>
          <StatusSwitch checked={activo} />
          <input type="checkbox" checked={activo} onChange={(event) => setActivo(event.target.checked)} className="sr-only" />
        </label>
      </header>

      <form onSubmit={submit} className="w-full space-y-2 px-0 pb-14 pt-2">
        <section className="w-full rounded-xl border p-2.5 shadow-sm" style={{ background: 'var(--app-surface)', borderColor: 'var(--app-border)', boxShadow: 'var(--app-shadow)' }}>
          <div className="grid grid-cols-[34%_minmax(0,1fr)] gap-2">
            <div className="min-w-0">
              <div className="relative overflow-hidden rounded-lg border" style={{ borderColor: 'var(--app-border)', background: 'var(--app-surface-soft)' }}>
                <div className="aspect-square w-full">
                  {fotoUrl ? <img src={fotoUrl} alt={`Foto de ${nombre || 'la familia'}`} className="h-full w-full object-cover" onError={(event) => { event.currentTarget.style.display = 'none'; }} /> : <div className="flex h-full items-center justify-center" style={{ color: 'var(--app-muted)' }}><ImageIcon size={30} /></div>}
                  {uploading && <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-black/60 text-white backdrop-blur-sm"><div className="mb-2 h-5 w-5 animate-spin rounded-full border-b-2 border-white" /><span className="text-[10px] font-bold">Subiendo...</span></div>}
                  {uploadSuccess && <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-emerald-500/80 text-white"><Check size={24} /><span className="text-[10px] font-bold">Foto subida</span></div>}
                </div>
              </div>
              <label className="mt-1.5 flex h-7 w-full cursor-pointer items-center justify-center gap-1.5 rounded-lg bg-orange-500 px-2 text-[9px] font-bold text-white active:opacity-80">
                <Camera size={13} />{fotoUrl ? 'Cambiar foto' : 'Añadir foto'}
                <input ref={inputRef} type="file" accept="image/jpeg,image/png,image/webp" onChange={handleFile} disabled={uploading || saving} className="hidden" />
              </label>
              {fotoUrl && <button type="button" onClick={() => setDeleteFotoOpen(true)} disabled={uploading || saving} className="mt-1 flex h-7 w-full items-center justify-center rounded-lg border bg-transparent text-[9px] font-bold text-red-500" style={{ borderColor: 'var(--app-border)' }}>Eliminar foto</button>}
            </div>

            <div className="min-w-0 space-y-1.5">
              <label className="block"><span className="mb-0.5 block text-[9px] font-semibold uppercase" style={{ color: 'var(--app-muted)' }}>Nombre de la familia *</span><input required value={nombre} onChange={(event) => setNombre(event.target.value)} maxLength={100} className="h-9 w-full rounded-lg border bg-transparent px-2.5 text-[14px] font-semibold outline-none focus:border-orange-500" style={{ borderColor: 'var(--app-border)', color: 'var(--app-text)' }} /></label>
              <label className="block"><span className="mb-0.5 block text-[9px] font-semibold uppercase" style={{ color: 'var(--app-muted)' }}>Descripción</span><textarea value={descripcion} onChange={(event) => setDescripcion(event.target.value)} rows={4} maxLength={250} className="w-full resize-none rounded-lg border bg-transparent px-2.5 py-1.5 text-[11px] leading-4 outline-none focus:border-orange-500" style={{ borderColor: 'var(--app-border)', color: 'var(--app-text)' }} /></label>
            </div>
          </div>
        </section>

        <div className="px-2">
          <button type="submit" disabled={saving || uploading || !nombre.trim()} className="flex h-10 w-full items-center justify-center gap-2 rounded-xl bg-orange-500 text-sm font-extrabold text-white disabled:opacity-40"><Save size={17} />{isEditing ? 'Guardar cambios' : 'Crear familia'}</button>
        </div>
      </form>

      {isEditing && familia && <AppModal open={deleteOpen} title="¿Eliminar familia?" message={`Se eliminará «${familia.nombre}». Esta acción no se puede deshacer.`} confirmLabel="Eliminar" cancelLabel="Cancelar" danger onCancel={() => setDeleteOpen(false)} onConfirm={() => void confirmDelete()} />}
      <AppModal open={deleteFotoOpen} title="¿Eliminar foto?" message="La foto se eliminará del almacenamiento y la familia quedará sin imagen." confirmLabel="Eliminar foto" cancelLabel="Cancelar" danger onCancel={() => setDeleteFotoOpen(false)} onConfirm={() => void confirmDeleteFoto()} />
      <AppModal open={Boolean(feedback)} title={feedback?.title ?? ''} message={feedback?.message ?? ''} confirmLabel="Aceptar" cancelLabel="Cerrar" danger={feedback?.danger} onCancel={() => setFeedback(null)} onConfirm={() => setFeedback(null)} />
    </div>
  );
}
