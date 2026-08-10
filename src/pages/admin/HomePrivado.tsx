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
        <header className="mb-4 flex items-center justify-between rounded-3xl border px-5 py-4 shadow-sm sm:px-7 sm:py-5" style={{ background: 'var(--app-surface)', borderColor: 'var(--app-border)', boxShadow: 'var(--app-shadow)' }}>
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.18em]" style={{ color: 'var(--app-muted)' }}>Carta Digital</p>
            <h1 className="mt-1 text-2xl font-extrabold tracking-tight sm:text-3xl">Panel Privado</h1>
          </div>
          <Link to="/admin/configuracion" className="flex h-11 w-11 items-center justify-center rounded-2xl" style={{ background: 'var(--app-surface-soft)', color: 'var(--app-text)' }} aria-label="Configuración">
            <Settings size={23} strokeWidth={1.8} />
          </Link>
        </header>

        <section className="mb-4 px-1">
          <h2 className="text-lg font-extrabold sm:text-xl">¿Qué quieres gestionar?</h2>
          <p className="mt-1 text-sm" style={{ color: 'var(--app-muted)' }}>Accede directamente a cada parte de la carta.</p>
        </section>

        <section className="grid grid-cols-1 gap-3 sm:grid-cols-3 sm:gap-4">
          {sections.map(({ title, description, icon: Icon, accent, path }) => (
            <Link key={title} to={path} className="group min-h-40 rounded-3xl border p-4 transition-transform hover:-translate-y-0.5 sm:min-h-44 sm:p-5" style={{ background: 'var(--app-surface)', borderColor: 'var(--app-border)', boxShadow: 'var(--app-shadow)' }}>
              <div className="flex items-start justify-between gap-2">
                <span className="flex h-12 w-12 items-center justify-center rounded-2xl" style={{ background: `${accent}18`, color: accent }}><Icon size={25} strokeWidth={2} /></span>
                <ArrowRight size={20} style={{ color: 'var(--app-muted)' }} />
              </div>
              <div className="mt-5">
                <h3 className="text-lg font-extrabold leading-tight">{title}</h3>
                <p className="mt-1.5 text-xs leading-5 sm:text-sm" style={{ color: 'var(--app-muted)' }}>{description}</p>
              </div>
            </Link>
          ))}
        </section>
      </div>
    </div>
  );
}
