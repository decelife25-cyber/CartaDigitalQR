import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Search, ChevronLeft, Sun, Moon } from 'lucide-react';
import { api } from '../../services/api';
import type { Configuracion } from '../../types/database';

function toggleTheme() {
  const root = document.documentElement;
  const night = !root.classList.contains('theme-night');
  root.classList.toggle('theme-night', night);
  window.localStorage.setItem('carta-theme', night ? 'night' : 'day');
  window.dispatchEvent(new CustomEvent('carta-theme-change'));
}

export default function TopNavigation() {
  const navigate = useNavigate();
  const location = useLocation();
  const [config, setConfig] = useState<Configuracion | null>(null);
  const [night, setNight] = useState(() => document.documentElement.classList.contains('theme-night'));

  useEffect(() => {
    async function loadConfig() {
      const data = await api.getConfiguracion();
      if (data) setConfig(data);
    }
    loadConfig();

    const syncTheme = () => setNight(document.documentElement.classList.contains('theme-night'));
    window.addEventListener('carta-theme-change', syncTheme);
    return () => window.removeEventListener('carta-theme-change', syncTheme);
  }, []);

  const showBackButton = location.pathname !== '/familias';

  return (
    <header className="sticky top-0 z-50 flex items-center justify-between border-b px-3 py-2.5" style={{ background: 'var(--app-surface)', borderColor: 'var(--app-border)' }}>
      <div className="flex w-1/3 items-center gap-2">
        {showBackButton && (
          <button
            onClick={() => navigate(-1)}
            className="rounded-full p-1.5 transition-colors hover:bg-black/5 theme-night:hover:bg-white/5"
            aria-label="Volver"
          >
            <ChevronLeft className="h-6 w-6" style={{ color: 'var(--app-text)' }} />
          </button>
        )}
      </div>

      <div className="flex flex-1 items-center justify-center">
        {config?.logotipo_url ? (
          <img
            src={config.logotipo_url}
            alt={config.nombre_restaurante}
            className="h-8 object-contain"
          />
        ) : (
          <span className="truncate text-lg font-bold" style={{ color: 'var(--app-text)' }}>
            {config?.nombre_restaurante || 'Carta Digital'}
          </span>
        )}
      </div>

      <div className="flex w-1/3 justify-end gap-1">
        <button
          onClick={toggleTheme}
          className="rounded-full p-2 transition-colors hover:bg-black/5 theme-night:hover:bg-white/5"
          aria-label={night ? 'Cambiar a modo día' : 'Cambiar a modo noche'}
          title={night ? 'Modo día' : 'Modo noche'}
        >
          {night ? <Sun className="h-5 w-5" style={{ color: 'var(--app-text)' }} /> : <Moon className="h-5 w-5" style={{ color: 'var(--app-text)' }} />}
        </button>
        <button
          onClick={() => navigate('/buscar')}
          className="rounded-full p-2 transition-colors hover:bg-black/5 theme-night:hover:bg-white/5"
          aria-label="Buscar"
        >
          <Search className="h-5 w-5" style={{ color: 'var(--app-text)' }} />
        </button>
      </div>
    </header>
  );
}