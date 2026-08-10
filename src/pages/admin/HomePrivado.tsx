import { FolderOpen, Package, Settings, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

const sections = [
  {
    title: 'Familias',
    description: 'Organiza las categorías de la carta.',
    icon: FolderOpen,
    accent: '#8b5cf6',
    path: '/admin/familias',
  },
  {
    title: 'Productos',
    description: 'Crea, edita y ordena los platos.',
    icon: Package,
    accent: '#f59e0b',
    path: '/admin/productos',
  },
  {
    title: 'Configuración',
    description: 'Ajustes generales de la carta.',
    icon: Settings,
    accent: '#64748b',
    path: '/admin/configuracion',
  },
] as const;

export default function HomePrivado() {
  return (
    <div className="min-h-[calc(100dvh-2rem)] w-full" style={{ color: 'var(--app-text)' }}>
      <div className="mx-auto w-full max-w-5xl px-2 py-2 sm:px-4 sm:py-4">
        <header className="mb-3 flex items-center justify-between rounded-3xl border px-5 py-3 shadow-sm sm:px-7 sm:py-4" style={{ background: 'var(--app-surface)', borderColor: 'var(--app-border)', boxShadow: 'var(--app-shadow)' }}>
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.18em]" style={{ color: 'var(--app-muted)' }}>Carta Digital</p>
            <h1 className="mt-1 text-2xl font-extrabold tracking-tight sm:text-3xl">Panel Privado</h1>
          </div>
          <Link to="/admin/configuracion" className="flex h-11 w-11 items-center justify-center rounded-2xl" style={{ background: 'var(--app-surface-soft)', color: 'var(--app-text)' }} aria-label="Configuración">
            <Settings size={23} strokeWidth={1.8} />
          </Link>
        </header>

        <section className="mb-3 px-1">
          <h2 className="text-lg font-extrabold sm:text-xl">¿Qué quieres gestionar?</h2>
          <p className="mt-1 text-sm" style={{ color: 'var(--app-muted)' }}>Accede directamente a cada parte de la carta.</p>
        </section>

        <section className="grid grid-cols-1 gap-2 sm:grid-cols-3 sm:gap-3">
          {sections.map(({ title, description, icon: Icon, accent, path }) => (
            <Link key={title} to={path} className="group min-h-32 rounded-3xl border p-3 transition-transform hover:-translate-y-0.5 sm:min-h-36 sm:p-4" style={{ background: 'var(--app-surface)', borderColor: 'var(--app-border)', boxShadow: 'var(--app-shadow)' }}>
              <div className="flex items-start justify-between gap-2">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl" style={{ background: `${accent}18`, color: accent }}><Icon size={22} strokeWidth={2} /></span>
                <ArrowRight size={19} style={{ color: 'var(--app-muted)' }} />
              </div>
              <div className="mt-3">
                <h3 className="text-lg font-extrabold leading-tight">{title}</h3>
                <p className="mt-1 text-xs leading-4 sm:text-sm" style={{ color: 'var(--app-muted)' }}>{description}</p>
              </div>
            </Link>
          ))}
        </section>
      </div>
    </div>
  );
}
