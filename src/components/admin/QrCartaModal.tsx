import { useEffect, useMemo, useState } from 'react';
import { Copy, ExternalLink, QrCode, X } from 'lucide-react';
import { supabase } from '../../lib/supabase';

export function getPublicCartaUrl(configuredDomain?: string | null): string {
  const rawDomain = configuredDomain?.trim();
  if (rawDomain) {
    const normalized = /^https?:\/\//i.test(rawDomain) ? rawDomain : `https://${rawDomain}`;
    return normalized.replace(/\/+$/, '');
  }
  return new URL(import.meta.env.BASE_URL || '/', window.location.origin).href;
}

export function getQrImageUrl(publicUrl: string, configuredQrUrl?: string | null): string {
  return configuredQrUrl?.trim() || `https://api.qrserver.com/v1/create-qr-code/?size=360x360&margin=12&data=${encodeURIComponent(publicUrl)}`;
}

export default function QrCartaModal({ onClose }: { onClose: () => void }) {
  const [configuredDomain, setConfiguredDomain] = useState<string | null>(null);
  const [configuredQrUrl, setConfiguredQrUrl] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    let active = true;
    void supabase.from('configuracion_restaurante').select('dominio, qr_url').eq('activo', true).limit(1).maybeSingle().then(({ data }) => {
      if (active && data) {
        setConfiguredDomain(data.dominio ?? null);
        setConfiguredQrUrl(data.qr_url ?? null);
      }
    });
    return () => { active = false; };
  }, []);

  const publicUrl = useMemo(() => getPublicCartaUrl(configuredDomain), [configuredDomain]);
  const qrImageUrl = getQrImageUrl(publicUrl, configuredQrUrl);

  const copyUrl = async () => {
    try {
      await navigator.clipboard.writeText(publicUrl);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      setCopied(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/55 p-4" role="dialog" aria-modal="true" aria-label="Código QR de la carta">
      <div className="w-full max-w-sm rounded-3xl border bg-[var(--app-surface)] p-5 shadow-2xl" style={{ borderColor: 'var(--app-border)' }}>
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-orange-400/10 text-orange-500"><QrCode size={23} /></span>
            <div><h2 className="text-lg font-extrabold">Código QR</h2><p className="text-xs text-[var(--app-muted)]">Comparte la carta con tus clientes.</p></div>
          </div>
          <button type="button" onClick={onClose} className="flex h-9 w-9 items-center justify-center rounded-xl text-[var(--app-muted)]" aria-label="Cerrar"><X size={20} /></button>
        </div>

        <div className="mt-4 flex justify-center rounded-2xl bg-white p-4">
          <img src={qrImageUrl} alt="Código QR para abrir la carta" className="h-64 w-64 object-contain" />
        </div>

        <p className="mt-3 text-center text-xs font-semibold text-[var(--app-muted)]">Escanea este código para abrir la carta digital.</p>
        <div className="mt-3 flex items-center gap-2 rounded-xl border bg-[var(--app-surface-soft)] px-3 py-2" style={{ borderColor: 'var(--app-border)' }}>
          <span className="min-w-0 flex-1 break-all text-xs font-semibold">{publicUrl}</span>
          <button type="button" onClick={() => void copyUrl()} className="flex h-8 shrink-0 items-center gap-1 rounded-lg bg-[var(--app-surface)] px-2 text-xs font-bold" aria-label="Copiar enlace de la carta"><Copy size={14} />{copied ? 'Copiado' : 'Copiar'}</button>
        </div>
        <a href={publicUrl} target="_blank" rel="noreferrer" className="mt-3 flex h-10 items-center justify-center gap-2 rounded-xl border text-sm font-extrabold" style={{ borderColor: 'var(--app-border)' }}><ExternalLink size={16} />Abrir carta</a>
      </div>
    </div>
  );
}
