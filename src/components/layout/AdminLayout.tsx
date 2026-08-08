import { useEffect, useState } from 'react';
import { Outlet, useNavigate, Link } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import type { Session } from '@supabase/supabase-js';
import { LogOut, Package } from 'lucide-react';

export default function AdminLayout() {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
      if (!session) navigate('/admin/login');
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (!session) navigate('/admin/login');
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  if (loading) {
    return (
      <div className="flex h-screen w-screen items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!session) {
    return null; // Will redirect via useEffect
  }

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/admin/login');
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col md:flex-row">
      {/* Sidebar / Topbar */}
      <nav className="bg-white border-b md:border-r border-gray-200 w-full md:w-64 flex-shrink-0 md:min-h-screen">
        <div className="p-4 md:p-6 flex justify-between items-center md:flex-col md:items-start md:gap-6">
          <h1 className="text-xl font-bold text-gray-900">Panel Privado</h1>

          <div className="flex gap-4 md:flex-col md:w-full">
            <Link
              to="/admin/productos"
              className="flex items-center gap-2 text-gray-700 hover:text-primary transition-colors font-medium p-2 md:p-0"
            >
              <Package size={20} />
              <span className="hidden md:inline">Productos</span>
            </Link>

            <button
              onClick={handleLogout}
              className="flex items-center gap-2 text-red-600 hover:text-red-700 transition-colors font-medium p-2 md:p-0 md:mt-auto"
            >
              <LogOut size={20} />
              <span className="hidden md:inline">Cerrar Sesión</span>
            </button>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="flex-1 p-4 md:p-8 overflow-auto">
        <Outlet />
      </main>
    </div>
  );
}
