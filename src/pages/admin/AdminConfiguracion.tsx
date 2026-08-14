import { useEffect, useMemo, useState } from 'react';
import { ArrowLeft, Check, Save } from 'lucide-react';
import { Link } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { getPublicCartaUrl, getQrImageUrl } from '../../components/admin/QrCartaModal';

type ConfiguracionRestaurante = {
  id: string;
  nombre: string;
  logo_url: string | null;
  color_principal: string | null;
  descripcion: string | null;
  direccion: string | null;
  telefono: string | null;
  redes_sociales: Record<string, string> | null;
  horario: string | null;
  qr_url: string | null;
  dominio: string | null;
  url_reservas_mesa: string | null;
  activo: boolean | null;
};

const EMPTY: ConfiguracionRestaurante = {
  id: '', nombre: '', logo_url: null, color_principal: '#c8a96e', descripcion: null,
  direccion: null, telefono: null, redes_sociales: {}, horario: null, qr_url: null,
  dominio: null, url_reservas_mesa: null, activo: true,
};

function errorMessage(error: unknown): string {
  if (error instanceof Error) return error.message;
  if (error && typeof error === 'object') {
    const value = error as { message?: unknown; details?: unknown; hint?: unknown; code?: unknown };
    if (typeof value.message === 'string' && value.message.trim()) return value.message;
    if (typeof value.details === 'string' && value.details.trim()) return value.details;
    if (typeof value.hint === 'string' && value.hint.trim()) return value.hint;
    if (typeof value.code === 'string' && value.code.trim()) return `Error ${value.code}`;
  }
  return 'Se produjo un error inesperado.';
}

function Field({ label, value, onChange, placeholder, type = 'text' }: { label: string; value: string; onChange: (v: string) => void; placeholder?: string; type?: string }) {
  return <label className="block min-w-0"><span className="mb-1 block text-[10px] font-bold uppercase tracking-wide text-[var(--app-muted)]">{label}</span><input type={type} value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} className="h-9 w-full min-w-0 rounded-md border border-[var(--app-border)] bg-[var(--app-surface-soft)] px-2.5 text-xs text-[var(--app-text)] outline-none placeholder:text-[var(--app-muted)] focus:border-orange-400/60" /></label>;
}

export default function AdminConfiguracion() {
  const [config, setConfig] = useState(EMPTY);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const publicUrl = useMemo(() => getPublicCartaUrl(), []);
  const qrImageUrl = getQrImageUrl(publicUrl, config.qr_url);

  const load = async () => {
    setLoading(true); setError(null);
    try {
      const { data, error: queryError } = await supabase.from('configuracion_restaurante').select('*').eq('activo', true).limit(1).maybeSingle();
      if (queryError) throw queryError;
      if (data) setConfig({ ...EMPTY, ...data, redes_sociales: data.redes_sociales ?? {} });
    } catch (e) { setError(errorMessage(e)); }
    finally { setLoading(false); }
  };

  useEffect(() => { void load(); }, []);

  const set = (key: keyof ConfiguracionRestaurante, value: string) => setConfig((current) => ({ ...current, [key]: value }));

  const save = async () => {
    if (!config.id) return;
    setSaving(true); setSaved(false); setError(null);
    try {
      const { error: updateError } = await supabase.from('configuracion_restaurante').update({
        nombre: config.nombre.trim(), logo_url: config.logo_url?.trim() || null,
        color_principal: config.color_principal?.trim() || null,
        descripcion: config.descripcion?.trim() || null, direccion: config.direccion?.trim() || null,
        telefono: config.telefono?.trim() || null, horario: config.horario?.trim() || null,
        qr_url: config.qr_url?.trim() || null,
        url_reservas_mesa: config.url_reservas_mesa?.trim() || null,
        redes_sociales: config.redes_sociales ?? {}, updated_at: new Date().toISOString(),
      }).eq('id', config.id);
      if (updateError) throw updateError;
      setSaved(true); window.setTimeout(() => setSaved(false), 2200);
    } catch (e) { setError(errorMessage(e)); }
    finally { setSaving(false); }
  };

  if (loading) return <div className="flex min-h-[60vh] w-full items-center justify-center" style={{ background: 'var(--app-bg)' }}><div className="h-7 w-7 animate-spin rounded-full border-b-2 border-orange-400" /></div>;

  return <div className="mx-0 min-h-[calc(100dvh-1rem)] w-full min-w-0 max-w-none overflow-x-hidden pb-5 text-[var(--app-text)]">
    <header className="sticky top-0 z-30 flex h-12 min-w-0 items-center gap-2 border-b bg-[var(--app-bg)]/95 backdrop-blur" style={{ borderColor: 'var(--app-border)' }}>
      <Link to="/admin" className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg text-[var(--app-muted)] hover:bg-black/5 dark:hover:bg-white/5" aria-label="Volver al inicio"><ArrowLeft size={19} /></Link>
      <div className="min-w-0"><h1 className="text-lg font-extrabold">Configuración</h1><p className="text-[9px] font-semibold uppercase tracking-wide text-[var(--app-muted)]">Datos de la carta</p></div>
      <button type="button" onClick={() => void save()} disabled={saving || !config.id} className="ml-auto inline-flex h-8 flex-shrink-0 items-center gap-1 rounded-md bg-orange-400 px-2.5 text-xs font-extrabold text-[#111] disabled:opacity-45"><Save size={14} />{saving ? 'Guardando…' : 'Guardar'}</button>
    </header>

    {error && <div className="mt-2 w-full min-w-0 rounded-xl border border-red-400/20 bg-[var(--app-surface)] p-3 text-xs text-red-400">{error}<button type="button" onClick={() => void load()} className="ml-2 font-bold text-orange-400">Reintentar</button></div>}

    <section className="mt-2 w-full min-w-0 rounded-xl border bg-[var(--app-surface)] p-2.5" style={{ borderColor: 'var(--app-border)' }}>
      <div className="mb-2 flex min-w-0 items-center justify-between gap-2"><div className="min-w-0"><h2 className="text-sm font-extrabold">Restaurante</h2><p className="text-[9px] text-[var(--app-muted)]">Información que verá el cliente en la carta.</p></div><span className="flex-shrink-0 rounded-full bg-green-400/10 px-2 py-0.5 text-[9px] font-bold text-green-500">Activo</span></div>
      <div className="grid min-w-0 gap-2 sm:grid-cols-2">
        <Field label="Nombre" value={config.nombre} onChange={(v) => set('nombre', v)} />
        <Field label="Teléfono" value={config.telefono ?? ''} onChange={(v) => set('telefono', v)} type="tel" />
        <div className="min-w-0 sm:col-span-2"><Field label="Dirección" value={config.direccion ?? ''} onChange={(v) => set('direccion', v)} /></div>
        <div className="min-w-0 sm:col-span-2"><label className="block"><span className="mb-1 block text-[10px] font-bold uppercase tracking-wide text-[var(--app-muted)]">Descripción</span><textarea value={config.descripcion ?? ''} onChange={(e) => set('descripcion', e.target.value)} rows={2} className="w-full min-w-0 resize-none rounded-md border bg-[var(--app-surface-soft)] px-2.5 py-1.5 text-xs text-[var(--app-text)] outline-none focus:border-orange-400/60" style={{ borderColor: 'var(--app-border)' }} /></label></div>
        <div className="min-w-0 sm:col-span-2"><label className="block"><span className="mb-1 block text-[10px] font-bold uppercase tracking-wide text-[var(--app-muted)]">Horario</span><textarea value={config.horario ?? ''} onChange={(e) => set('horario', e.target.value)} rows={2} className="w-full min-w-0 resize-none rounded-md border bg-[var(--app-surface-soft)] px-2.5 py-1.5 text-xs text-[var(--app-text)] outline-none focus:border-orange-400/60" style={{ borderColor: 'var(--app-border)' }} /></label></div>
      </div>
    </section>

    <section className="mt-2 w-full min-w-0 rounded-xl border bg-[var(--app-surface)] p-2.5" style={{ borderColor: 'var(--app-border)' }}>
      <h2 className="text-sm font-extrabold">Código QR de la carta</h2>
      <p className="mb-2 text-[9px] text-[var(--app-muted)]">Código para imprimir o enseñar al cliente. La dirección de abajo es la que abre el QR.</p>
      <div className="grid min-w-0 gap-3 sm:grid-cols-[150px_minmax(0,1fr)] sm:items-center">
        <div className="flex justify-center rounded-xl bg-white p-2"><img src={qrImageUrl} alt="Código QR de la carta" className="h-32 w-32 object-contain" /></div>
        <div className="min-w-0 space-y-2">
          <div><span className="mb-1 block text-[10px] font-bold uppercase tracking-wide text-[var(--app-muted)]">Enlace de la carta</span><div className="break-all rounded-md border bg-[var(--app-surface-soft)] px-2.5 py-2 text-xs font-semibold" style={{ borderColor: 'var(--app-border)' }}>{publicUrl}</div></div>
          <Field label="URL de la imagen QR (opcional)" value={config.qr_url ?? ''} onChange={(v) => set('qr_url', v)} placeholder="https://…" />
        </div>
      </div>
    </section>

    <section className="mt-2 w-full min-w-0 rounded-xl border bg-[var(--app-surface)] p-2.5" style={{ borderColor: 'var(--app-border)' }}>
      <h2 className="text-sm font-extrabold">Reserva de mesa</h2><p className="mb-2 text-[9px] text-[var(--app-muted)]">Aplicación externa que se abrirá al pulsar "Reservar mesa" en la portada.</p>
      <Field label="Programa de reservas de mesa" value={config.url_reservas_mesa ?? ''} onChange={(v) => set('url_reservas_mesa', v)} placeholder="https://…" type="url" />
    </section>

    <section className="mt-2 w-full min-w-0 rounded-xl border bg-[var(--app-surface)] p-2.5" style={{ borderColor: 'var(--app-border)' }}>
      <h2 className="text-sm font-extrabold">Identidad visual</h2><p className="mb-2 text-[9px] text-[var(--app-muted)]">Logo y color principal de la carta.</p>
      <div className="grid min-w-0 gap-2 sm:grid-cols-2">
        <Field label="URL del logotipo" value={config.logo_url ?? ''} onChange={(v) => set('logo_url', v)} placeholder="https://…" />
        <label className="block min-w-0"><span className="mb-1 block text-[10px] font-bold uppercase tracking-wide text-[var(--app-muted)]">Color principal</span><div className="flex h-9 min-w-0 gap-2"><input type="color" value={config.color_principal || '#c8a96e'} onChange={(e) => set('color_principal', e.target.value)} className="h-9 w-11 flex-shrink-0 rounded-md border bg-[var(--app-surface-soft)] p-1" style={{ borderColor: 'var(--app-border)' }} /><input value={config.color_principal ?? ''} onChange={(e) => set('color_principal', e.target.value)} className="min-w-0 flex-1 rounded-md border bg-[var(--app-surface-soft)] px-2.5 text-xs text-[var(--app-text)] outline-none focus:border-orange-400/60" style={{ borderColor: 'var(--app-border)' }} /></div></label>
      </div>
    </section>

    <section className="mt-2 w-full min-w-0 rounded-xl border bg-[var(--app-surface)] p-2.5" style={{ borderColor: 'var(--app-border)' }}>
      <h2 className="text-sm font-extrabold">Redes sociales</h2><p className="mb-2 text-[9px] text-[var(--app-muted)]">Enlaces opcionales que puede mostrar la carta.</p>
      <div className="grid min-w-0 gap-2 sm:grid-cols-2">
        {(['instagram', 'facebook', 'web'] as const).map((key) => <Field key={key} label={key} value={config.redes_sociales?.[key] ?? ''} onChange={(value) => setConfig((current) => ({ ...current, redes_sociales: { ...(current.redes_sociales ?? {}), [key]: value } }))} placeholder="https://…" />)}
      </div>
    </section>

    <button type="button" onClick={() => void save()} disabled={saving || !config.id} className="mt-2 flex h-10 w-full min-w-0 items-center justify-center gap-2 rounded-md bg-orange-400 text-xs font-extrabold text-[#111] disabled:opacity-45"><Save size={15} />{saving ? 'Guardando…' : 'Guardar configuración'}</button>
    {saved && <div className="mt-2 flex w-full min-w-0 items-center justify-center gap-1.5 rounded-md border border-green-400/20 bg-green-400/10 py-2 text-xs font-bold text-green-500"><Check size={15} />Cambios guardados</div>}
  </div>;
}
