import { useEffect, useState } from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import type { Session } from '@supabase/supabase-js';
import { Home, LogOut, Moon, Package, Sun } from 'lucide-react';

function toggleTheme() {
  const root = document.documentElement;
  const night = !root.classList.contains('theme-night');
  root.classList.toggle('theme-night', night);
  window.localStorage.setItem('carta-theme', night ? 'night' : 'day');
  window.dispatchEvent(new CustomEvent('carta-theme-change'));
}

export default function AdminLayout() {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [night, setNight] = useState(() => document.documentElement.classList.contains('theme-night'));
  const navigate = useNavigate();
  const location = useLocation();
  const isHome = location.pathname === '/admin' || location.pathname === '/admin/';

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
      if (!session) navigate('/admin/login');
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession);
      if (!nextSession) navigate('/admin/login');
    });

    const syncTheme = () => setNight(document.documentElement.classList.contains('theme-night'));
    window.addEventListener('carta-theme-change', syncTheme);

    return () => {
      subscription.unsubscribe();
      window.removeEventListener('carta-theme-change', syncTheme);
    };
  }, [navigate]);

  if (loading) {
    return (
      <div className="flex h-screen w-screen items-center justify-center" style={{ background: 'var(--app-bg)' }}>
        <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-primary" />
      </div>
    );
  }

  if (!session) return null;

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/admin/login');
  };

  if (isHome) {
    return (
      <div className="min-h-screen" style={{ background: 'var(--app-bg)', color: 'var(--app-text)' }}>
        <header
          className="sticky top-0 z-30 flex h-16 items-center justify-between border-b px-4 sm:px-6"
          style={{ background: 'var(--app-surface)', borderColor: 'var(--app-border)' }}
        >
          <Link to="/admin" className="text-xl font-extrabold tracking-tight sm:text-2xl">
            Panel Privado
          </Link>

          <div className="flex items-center gap-1 sm:gap-2">
            <button
              type="button"
              onClick={toggleTheme}
              className="flex h-10 w-10 items-center justify-center rounded-xl transition-colors hover:bg-black/5 dark:hover:bg-white/5"
              aria-label={night ? 'Cambiar a modo día' : 'Cambiar a modo noche'}
              title={night ? 'Modo día' : 'Modo noche'}
            >
              {night ? <Sun size={22} /> : <Moon size={22} />}
            </button>
            <Link
              to="/admin/productos"
              className="flex h-10 w-10 items-center justify-center rounded-xl transition-colors hover:bg-black/5 dark:hover:bg-white/5"
              aria-label="Productos"
              title="Productos"
            >
              <Package size={22} />
            </Link>
            <button
              type="button"
              onClick={handleLogout}
              className="flex h-10 w-10 items-center justify-center rounded-xl text-red-500 transition-colors hover:bg-red-50"
              aria-label="Cerrar sesión"
              title="Cerrar sesión"
            >
              <LogOut size={22} />
            </button>
          </div>
        </header>
        <main className="w-full p-3 sm:p-5 md:p-7">
          <Outlet />
        </main>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col md:flex-row" style={{ background: 'var(--app-bg)', color: 'var(--app-text)' }}>
      <nav className="w-full flex-shrink-0 border-b md:min-h-screen md:w-64 md:border-r" style={{ background: 'var(--app-surface)', borderColor: 'var(--app-border)' }}>
        <div className="flex items-center justify-between p-4 md:flex-col md:items-start md:gap-6 md:p-6">
          <div className="flex items-center gap-2">
            <Link to="/admin" aria-label="Inicio privado" title="Inicio privado"><Home size={20} /></Link>
            <h1 className="text-xl font-bold">Panel Privado</h1>
          </div>

          <div className="flex items-center gap-2 md:w-full md:flex-col md:items-stretch md:gap-4">
            <Link to="/admin/productos" className="flex items-center gap-2 p-2 font-medium transition-opacity hover:opacity-70 md:p-0">
              <Package size={20} />
              <span className="hidden md:inline">Productos</span>
            </Link>
            <button
              type="button"
              onClick={toggleTheme}
              className="flex items-center gap-2 p-2 font-medium transition-opacity hover:opacity-70 md:p-0"
              aria-label={night ? 'Cambiar a modo día' : 'Cambiar a modo noche'}
              title={night ? 'Modo día' : 'Modo noche'}
            >
              {night ? <Sun size={20} /> : <Moon size={20} />}
              <span className="hidden md:inline">{night ? 'Modo día' : 'Modo noche'}</span>
            </button>
            <button onClick={handleLogout} className="flex items-center gap-2 p-2 font-medium text-red-600 transition-opacity hover:opacity-70 md:mt-auto md:p-0">
              <LogOut size={20} />
              <span className="hidden md:inline">Cerrar Sesión</span>
            </button>
          </div>
        </div>
      </nav>

      <main className="flex-1 overflow-auto p-4 md:p-8">
        <Outlet />
      </main>
    </div>
  );
}
