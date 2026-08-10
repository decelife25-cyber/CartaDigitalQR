import { NavLink } from 'react-router-dom';
import { Home, Search, Heart } from 'lucide-react';
import { useSelectionStore } from '../../store/selectionStore';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export default function BottomNavigation() {
  const selectedCount = useSelectionStore((state) => state.selectedIds.length);

  const navItems = [
    { to: '/familias', icon: Home, label: 'Carta' },
    { to: '/buscar', icon: Search, label: 'Buscar' },
    { to: '/seleccion', icon: Heart, label: 'Mi Selección', badge: selectedCount },
  ];

  return (
    <nav
      className="fixed bottom-0 z-50 w-full max-w-md border-t pb-safe"
      style={{ background: 'var(--app-surface)', borderColor: 'var(--app-border)' }}
    >
      <div className="flex h-16 items-center justify-around px-2">
        {navItems.map(({ to, icon: Icon, label, badge }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) => twMerge(
              clsx(
                'relative flex h-full w-full flex-col items-center justify-center space-y-1 text-xs font-medium transition-colors',
                isActive ? 'text-primary' : 'hover:opacity-80'
              )
            )}
            style={{ color: 'var(--app-text)' }}
          >
            {({ isActive }) => (
              <>
                <div className="relative">
                  <Icon className={clsx('h-6 w-6', isActive && 'fill-current')} />
                  {badge !== undefined && badge > 0 && (
                    <span className="absolute -right-2 -top-1.5 min-w-[18px] rounded-full bg-red-500 px-1.5 py-0.5 text-center text-[10px] font-bold text-white">
                      {badge}
                    </span>
                  )}
                </div>
                <span>{label}</span>
              </>
            )}
          </NavLink>
        ))}
      </div>
    </nav>
  );
}
