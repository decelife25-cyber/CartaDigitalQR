import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  FolderOpen,
  Package,
  Wheat,
  Lightbulb,
  Settings,
  ArrowRight,
  CheckCircle2,
} from 'lucide-react';

const sections = [
  {
    title: 'Familias',
    description: 'Organiza las categorías de la carta.',
    icon: FolderOpen,
    accent: '#8b5cf6',
    path: null,
  },
  {
    title: 'Productos',
    description: 'Crea, edita y ordena los platos.',
    icon: Package,
    accent: '#f59e0b',
    path: '/admin/productos',
  },
  {
    title: 'Alérgenos',
    description: 'Gestiona los alérgenos de la carta.',
    icon: Wheat,
    accent: '#10b981',
    path: null,
  },
  {
    title: 'Sugerencias',
    description: 'Notas y propuestas para mejorar la carta.',
    icon: Lightbulb,
    accent: '#3b82f6',
    path: null,
  },
  {
    title: 'Configuración',
    description: 'Ajustes generales de Carta Digital.',
    icon: Settings,
    accent: '#64748b',
    path: null,
  },
] as const;

export default function HomePrivado() {
  const [notice, setNotice] = useState<string | null>(null);

  return (
    <div className="min-h-[calc(100dvh-2rem)] w-full" style={{ color: 'var(--app-text)' }}>
      <div className="mx-auto w-full max-w-5xl px-2 py-2 sm:px-4 sm:py-4">
        <header
          className="mb-4 flex items-center justify-between rounded-3xl border px-5 py-4 shadow-sm sm:px-7 sm:py-5"
          style={{
            background: 'var(--app-surface)',
            borderColor: 'var(--app-border)',
            boxShadow: 'var(--app-shadow)',
          }}
        >
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.18em]" style={{ color: 'var(--app-muted)' }}>
              Carta Digital
            </p>
            <h1 className="mt-1 text-2xl font-extrabold tracking-tight sm:text-3xl">Panel Privado</h1>
          </div>
          <div
            className="flex h-11 w-11 items-center justify-center rounded-2xl"
            style={{ background: 'var(--app-surface-soft)', color: 'var(--app-text)' }}
          >
            <Settings size={23} strokeWidth={1.8} />
          </div>
        </header>

        <section className="mb-4 px-1">
          <h2 className="text-lg font-extrabold sm:text-xl">¿Qué quieres gestionar?</h2>
          <p className="mt-1 text-sm" style={{ color: 'var(--app-muted)' }}>
            Accede directamente a cada parte de la carta.
          </p>
        </section>

        <section className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4">
          {sections.map(({ title, description, icon: Icon, accent, path }) => {
            const content = (
              <>
                <div className="flex items-start justify-between gap-2">
                  <span
                    className="flex h-12 w-12 items-center justify-center rounded-2xl"
                    style={{ background: `${accent}18`, color: accent }}
                  >
                    <Icon size={25} strokeWidth={2} />
                  </span>
                  {path && <ArrowRight size={20} style={{ color: 'var(--app-muted)' }} />}
                </div>
                <div className="mt-5">
                  <h3 className="text-lg font-extrabold leading-tight">{title}</h3>
                  <p className="mt-1.5 text-xs leading-5 sm:text-sm" style={{ color: 'var(--app-muted)' }}>
                    {description}
                  </p>
                </div>
              </>
            );

            if (path) {
              return (
                <Link
                  key={title}
                  to={path}
                  className="group min-h-40 rounded-3xl border p-4 transition-transform hover:-translate-y-0.5 sm:min-h-44 sm:p-5"
                  style={{
                    background: 'var(--app-surface)',
                    borderColor: 'var(--app-border)',
                    boxShadow: 'var(--app-shadow)',
                  }}
                >
                  {content}
                </Link>
              );
            }

            return (
              <button
                key={title}
                type="button"
                onClick={() => setNotice(`${title}: sección preparada para su próxima implementación.`)}
                className="min-h-40 text-left rounded-3xl border p-4 transition-transform hover:-translate-y-0.5 sm:min-h-44 sm:p-5"
                style={{
                  background: 'var(--app-surface)',
                  borderColor: 'var(--app-border)',
                  boxShadow: 'var(--app-shadow)',
                }}
              >
                {content}
              </button>
            );
          })}
        </section>

        <div
          className="mt-4 flex items-center gap-3 rounded-2xl border px-4 py-3 text-sm"
          style={{
            background: 'var(--app-surface)',
            borderColor: 'var(--app-border)',
            color: 'var(--app-muted)',
          }}
        >
          <CheckCircle2 size={19} className="shrink-0" style={{ color: '#10b981' }} />
          <span>Panel preparado para trabajar pantalla a pantalla y mantener el mismo diseño visual.</span>
        </div>

        {notice && (
          <button
            type="button"
            onClick={() => setNotice(null)}
            className="fixed bottom-5 left-1/2 z-50 -translate-x-1/2 rounded-2xl px-5 py-3 text-sm font-semibold text-white shadow-xl"
            style={{ background: '#1f2937' }}
          >
            {notice}
          </button>
        )}
      </div>
    </div>
  );
}
