import { useEffect } from 'react';
import { Check, X } from 'lucide-react';

type AppSelectionModalOption = {
  value: string;
  label: string;
};

type AppSelectionModalProps = {
  open: boolean;
  title: string;
  value: string;
  options: AppSelectionModalOption[];
  onSelect: (value: string) => void;
  onCancel: () => void;
};

export default function AppSelectionModal({
  open,
  title,
  value,
  options,
  onSelect,
  onCancel,
}: AppSelectionModalProps) {
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
      className="fixed inset-0 z-[100] flex items-end justify-center bg-black/55 p-2 backdrop-blur-sm sm:items-center sm:p-4"
      role="presentation"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onCancel();
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="app-selection-modal-title"
        className="w-full max-w-md overflow-hidden rounded-3xl border shadow-2xl"
        style={{
          background: 'var(--app-surface)',
          borderColor: 'var(--app-border)',
          color: 'var(--app-text)',
        }}
      >
        <div className="flex items-center gap-2 border-b px-4 py-3" style={{ borderColor: 'var(--app-border)' }}>
          <h2 id="app-selection-modal-title" className="min-w-0 flex-1 text-base font-extrabold">
            {title}
          </h2>
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

        <div className="max-h-[min(70dvh,520px)] overflow-y-auto p-1.5">
          {options.map((option) => {
            const selected = option.value === value;
            return (
              <button
                key={option.value}
                type="button"
                onClick={() => onSelect(option.value)}
                className="flex min-h-11 w-full items-center gap-3 rounded-2xl px-3 py-2 text-left transition"
                style={selected
                  ? { background: 'rgba(16,185,129,.12)', color: '#10b981' }
                  : { color: 'var(--app-text)' }}
                aria-pressed={selected}
              >
                <span
                  className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2"
                  style={selected
                    ? { borderColor: '#10b981', background: '#10b981', color: '#fff' }
                    : { borderColor: 'var(--app-muted)', color: 'transparent' }}
                  aria-hidden="true"
                >
                  <Check size={14} strokeWidth={3} />
                </span>
                <span className={`min-w-0 flex-1 text-sm ${selected ? 'font-extrabold' : 'font-semibold'}`}>
                  {option.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
