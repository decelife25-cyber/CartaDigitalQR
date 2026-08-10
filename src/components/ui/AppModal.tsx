import { useEffect, type ReactNode } from 'react';
import { AlertTriangle, X } from 'lucide-react';

type AppModalProps = {
  open: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  danger?: boolean;
  content?: ReactNode;
  onConfirm: () => void;
  onCancel: () => void;
};

export default function AppModal({
  open,
  title,
  message,
  confirmLabel = 'Aceptar',
  cancelLabel = 'Cancelar',
  danger = false,
  content,
  onConfirm,
  onCancel,
}: AppModalProps) {
  useEffect(() => {
    if (!open) return undefined;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onCancel();
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [open, onCancel]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-end justify-center bg-black/60 p-4 backdrop-blur-sm sm:items-center"
      role="presentation"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onCancel();
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="app-modal-title"
        aria-describedby="app-modal-message"
        className="w-full max-w-sm rounded-3xl border p-5 shadow-2xl"
        style={{
          background: 'var(--app-surface)',
          borderColor: 'var(--app-border)',
          color: 'var(--app-text)',
        }}
      >
        <div className="flex items-start gap-3">
          <div
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl"
            style={{
              background: danger ? 'rgba(239,68,68,.12)' : 'rgba(249,115,22,.12)',
              color: danger ? '#ef4444' : '#f97316',
            }}
          >
            <AlertTriangle size={22} />
          </div>
          <div className="min-w-0 flex-1">
            <h2 id="app-modal-title" className="text-lg font-extrabold leading-tight">{title}</h2>
            <p id="app-modal-message" className="mt-2 text-sm leading-5" style={{ color: 'var(--app-muted)' }}>
              {message}
            </p>
          </div>
          <button
            type="button"
            onClick={onCancel}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl"
            style={{ color: 'var(--app-muted)' }}
            aria-label="Cerrar"
          >
            <X size={19} />
          </button>
        </div>

        {content}

        <div className="mt-5 flex gap-2">
          <button
            type="button"
            onClick={onCancel}
            className="h-11 flex-1 rounded-xl border text-sm font-extrabold"
            style={{ borderColor: 'var(--app-border)', color: 'var(--app-text)' }}
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className={`h-11 flex-1 rounded-xl text-sm font-extrabold text-white ${danger ? 'bg-red-500' : 'bg-orange-500'}`}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
