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
    <nav className="fixed bottom-0 w-full max-w-md bg-white border-t border-gray-200 pb-safe z-50">
      <div className="flex justify-around items-center h-16 px-2">
        {navItems.map(({ to, icon: Icon, label, badge }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) => twMerge(
              clsx(
                "flex flex-col items-center justify-center w-full h-full space-y-1 text-xs font-medium transition-colors relative",
                isActive ? "text-primary" : "text-gray-500 hover:text-gray-900"
              )
            )}
          >
            {({ isActive }) => (
              <>
                <div className="relative">
                  <Icon className={clsx("w-6 h-6", isActive && "fill-current")} />
                  {badge !== undefined && badge > 0 && (
                    <span className="absolute -top-1.5 -right-2 bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[18px] text-center">
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