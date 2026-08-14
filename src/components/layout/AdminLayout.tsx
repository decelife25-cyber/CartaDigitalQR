import { useEffect, useState } from 'react';
import { Home, LogOut, Moon, QrCode, Sun } from 'lucide-react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import type { Session } from '@supabase/supabase-js';
import QrCartaModal from '../admin/QrCartaModal';

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
  const [showQr, setShowQr] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

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

  const isHome = location.pathname === '/admin' || location.pathname === '/admin/';

  const HeaderActions = () => (
    <div className="flex items-center gap-1 sm:gap-2">
      <button type="button" onClick={() => setShowQr(true)} className="flex h-10 w-10 items-center justify-center rounded-xl transition-colors hover:bg-black/5 dark:hover:bg-white/5" aria-label="Mostrar código QR de la carta" title="Código QR de la carta">
        <QrCode size={22} />
      </button>
      <button type="button" onClick={toggleTheme} className="flex h-10 w-10 items-center justify-center rounded-xl transition-colors hover:bg-black/5 dark:hover:bg-white/5" aria-label={night ? 'Cambiar a modo día' : 'Cambiar a modo noche'} title={night ? 'Modo día' : 'Modo noche'}>
        {night ? <Sun size={22} /> : <Moon size={22} />}
      </button>
      <button type="button" onClick={handleLogout} className="flex h-10 w-10 items-center justify-center rounded-xl text-red-500 transition-colors hover:bg-red-50" aria-label="Cerrar sesión" title="Cerrar sesión">
        <LogOut size={22} />
      </button>
    </div>
  );

  return (
    <div className="min-h-screen" style={{ background: 'var(--app-bg)', color: 'var(--app-text)' }}>
      <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b px-4 sm:px-6" style={{ background: 'var(--app-surface)', borderColor: 'var(--app-border)' }}>
        <div className="flex min-w-0 items-center gap-2">
          {!isHome && <Link to="/admin" className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl transition-colors hover:bg-black/5 dark:hover:bg-white/5" aria-label="Volver al panel privado" title="Panel privado"><Home size={22} /></Link>}
          <Link to="/admin" className="text-xl font-extrabold tracking-tight sm:text-2xl">Panel Privado</Link>
        </div>
        <HeaderActions />
      </header>
      <main className="w-full p-3 sm:p-5 md:p-7"><Outlet /></main>
      {showQr && <QrCartaModal onClose={() => setShowQr(false)} />}
    </div>
  );
}
