import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Search, ChevronLeft } from 'lucide-react';
import { api } from '../../services/api';
import type { Configuracion } from '../../types/database';

export default function TopNavigation() {
  const navigate = useNavigate();
  const location = useLocation();
  const [config, setConfig] = useState<Configuracion | null>(null);

  useEffect(() => {
    async function loadConfig() {
      const data = await api.getConfiguracion();
      if (data) setConfig(data);
    }
    loadConfig();
  }, []);

  const showBackButton = location.pathname !== '/familias';

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between">
      <div className="flex items-center gap-3 w-1/3">
        {showBackButton && (
          <button
            onClick={() => navigate(-1)}
            className="p-1 rounded-full hover:bg-gray-100 transition-colors"
            aria-label="Volver"
          >
            <ChevronLeft className="w-6 h-6 text-gray-700" />
          </button>
        )}
      </div>

      <div className="flex-1 flex justify-center items-center">
        {config?.logo_url ? (
          <img
            src={config.logo_url}
            alt={config.nombre_restaurante}
            className="h-8 object-contain"
          />
        ) : (
          <span className="font-bold text-lg text-gray-900 truncate">
            {config?.nombre_restaurante || 'Carta Digital'}
          </span>
        )}
      </div>

      <div className="w-1/3 flex justify-end">
        <button
          onClick={() => navigate('/buscar')}
          className="p-2 rounded-full hover:bg-gray-100 transition-colors"
          aria-label="Buscar"
        >
          <Search className="w-5 h-5 text-gray-700" />
        </button>
      </div>
    </header>
  );
}