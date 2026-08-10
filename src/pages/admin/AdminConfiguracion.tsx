import { useEffect, useState } from 'react';
import { ArrowLeft, Check, Save } from 'lucide-react';
import { Link } from 'react-router-dom';
import { supabase } from '../../lib/supabase';

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
  activo: boolean | null;
};

const EMPTY: ConfiguracionRestaurante = {
  id: '', nombre: '', logo_url: null, color_principal: '#c8a96e', descripcion: null,
  direccion: null, telefono: null, redes_sociales: {}, horario: null, qr_url: null,
  dominio: null, activo: true,
};

function Field({ label, value, onChange, placeholder, type = 'text' }: { label: string; value: string; onChange: (v: string) => void; placeholder?: string; type?: string }) {
  return <label className="block"><span className="mb-1 block text-[10px] font-bold uppercase tracking-wide text-white/45">{label}</span><input type={type} value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} className="h-9 w-full rounded-md border border-white/10 bg-[#202020] px-2.5 text-xs text-white outline-none placeholder:text-white/25 focus:border-orange-400/60" /></label>;
}

export default function AdminConfiguracion() {
  const [config, setConfig] = useState(EMPTY);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = async () => {
    setLoading(true); setError(null);
    try {
      const { data, error: queryError } = await supabase.from('configuracion_restaurante').select('*').eq('activo', true).limit(1).maybeSingle();
      if (queryError) throw queryError;
      if (data) setConfig({ ...EMPTY, ...data, redes_sociales: data.redes_sociales ?? {} });
    } catch (e) { setError(e instanceof Error ? e.message : String(e)); }
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
        redes_sociales: config.redes_sociales ?? {}, updated_at: new Date().toISOString(),
      }).eq('id', config.id);
      if (updateError) throw updateError;
      setSaved(true); window.setTimeout(() => setSaved(false), 2200);
    } catch (e) { setError(e instanceof Error ? e.message : String(e)); }
    finally { setSaving(false); }
  };

  if (loading) return <div className="flex min-h-[60vh] items-center justify-center bg-[#111111]"><div className="h-7 w-7 animate-spin rounded-full border-b-2 border-orange-400" /></div>;

  return <div className="mx-auto min-h-[calc(100dvh-1rem)] w-full max-w-3xl bg-[#111111] px-2 pb-5 text-white sm:px-3">
    <header className="sticky top-0 z-30 flex h-12 items-center gap-2 border-b border-white/10 bg-[#111111]/95 backdrop-blur">
      <Link to="/admin" className="flex h-9 w-9 items-center justify-center rounded-lg text-white/75 hover:bg-white/5" aria-label="Volver al inicio"><ArrowLeft size={19} /></Link>
      <div className="min-w-0"><h1 className="text-lg font-extrabold">Configuración</h1><p className="text-[9px] font-semibold uppercase tracking-wide text-white/35">Datos de la carta</p></div>
      <button type="button" onClick={() => void save()} disabled={saving || !config.id} className="ml-auto inline-flex h-8 items-center gap-1 rounded-md bg-orange-400 px-2.5 text-xs font-extrabold text-[#111] disabled:opacity-45"><Save size={14} />{saving ? 'Guardando…' : 'Guardar'}</button>
    </header>

    {error && <div className="mt-2 rounded-xl border border-red-400/20 bg-[#171717] p-3 text-xs text-red-300">{error}<button type="button" onClick={() => void load()} className="ml-2 font-bold text-orange-300">Reintentar</button></div>}

    <section className="mt-2 rounded-xl border border-white/10 bg-[#171717] p-2.5">
      <div className="mb-2 flex items-center justify-between"><div><h2 className="text-sm font-extrabold">Restaurante</h2><p className="text-[9px] text-white/35">Información que verá el cliente en la carta.</p></div><span className="rounded-full bg-green-400/10 px-2 py-0.5 text-[9px] font-bold text-green-300">Activo</span></div>
      <div className="grid gap-2 sm:grid-cols-2">
        <Field label="Nombre" value={config.nombre} onChange={(v) => set('nombre', v)} />
        <Field label="Teléfono" value={config.telefono ?? ''} onChange={(v) => set('telefono', v)} type="tel" />
        <div className="sm:col-span-2"><Field label="Dirección" value={config.direccion ?? ''} onChange={(v) => set('direccion', v)} /></div>
        <div className="sm:col-span-2"><label className="block"><span className="mb-1 block text-[10px] font-bold uppercase tracking-wide text-white/45">Descripción</span><textarea value={config.descripcion ?? ''} onChange={(e) => set('descripcion', e.target.value)} rows={2} className="w-full resize-none rounded-md border border-white/10 bg-[#202020] px-2.5 py-1.5 text-xs text-white outline-none focus:border-orange-400/60" /></label></div>
        <div className="sm:col-span-2"><label className="block"><span className="mb-1 block text-[10px] font-bold uppercase tracking-wide text-white/45">Horario</span><textarea value={config.horario ?? ''} onChange={(e) => set('horario', e.target.value)} rows={2} className="w-full resize-none rounded-md border border-white/10 bg-[#202020] px-2.5 py-1.5 text-xs text-white outline-none focus:border-orange-400/60" /></label></div>
      </div>
    </section>

    <section className="mt-2 rounded-xl border border-white/10 bg-[#171717] p-2.5">
      <h2 className="text-sm font-extrabold">Identidad visual</h2><p className="mb-2 text-[9px] text-white/35">Logo y color principal de la carta.</p>
      <div className="grid gap-2 sm:grid-cols-2">
        <Field label="URL del logotipo" value={config.logo_url ?? ''} onChange={(v) => set('logo_url', v)} placeholder="https://…" />
        <label className="block"><span className="mb-1 block text-[10px] font-bold uppercase tracking-wide text-white/45">Color principal</span><div className="flex h-9 gap-2"><input type="color" value={config.color_principal || '#c8a96e'} onChange={(e) => set('color_principal', e.target.value)} className="h-9 w-11 rounded-md border border-white/10 bg-[#202020] p-1" /><input value={config.color_principal ?? ''} onChange={(e) => set('color_principal', e.target.value)} className="min-w-0 flex-1 rounded-md border border-white/10 bg-[#202020] px-2.5 text-xs text-white outline-none focus:border-orange-400/60" /></div></label>
      </div>
    </section>

    <section className="mt-2 rounded-xl border border-white/10 bg-[#171717] p-2.5">
      <h2 className="text-sm font-extrabold">Redes sociales</h2><p className="mb-2 text-[9px] text-white/35">Enlaces opcionales que puede mostrar la carta.</p>
      <div className="grid gap-2 sm:grid-cols-2">
        {(['instagram', 'facebook', 'web'] as const).map((key) => <Field key={key} label={key} value={config.redes_sociales?.[key] ?? ''} onChange={(value) => setConfig((current) => ({ ...current, redes_sociales: { ...(current.redes_sociales ?? {}), [key]: value } }))} placeholder="https://…" />)}
      </div>
    </section>

    <button type="button" onClick={() => void save()} disabled={saving || !config.id} className="mt-2 flex h-10 w-full items-center justify-center gap-2 rounded-md bg-orange-400 text-xs font-extrabold text-[#111] disabled:opacity-45"><Save size={15} />{saving ? 'Guardando…' : 'Guardar configuración'}</button>
    {saved && <div className="mt-2 flex items-center justify-center gap-1.5 rounded-md border border-green-400/20 bg-green-400/10 py-2 text-xs font-bold text-green-300"><Check size={15} />Cambios guardados</div>}
  </div>;
}
