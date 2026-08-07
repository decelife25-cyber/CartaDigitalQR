import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import type { Configuracion } from '../types/database';

export default function Portada() {
  const navigate = useNavigate();
  const [config, setConfig] = useState<Configuracion | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    async function loadConfig() {
      try {
        const data = await api.getConfiguracion();
        if (data) {
          setConfig(data);
          // Set dynamic primary color for Tailwind
          document.documentElement.style.setProperty('--color-primary', data.color_principal);
        } else {
          setError(true);
        }
      } catch {
        setError(true);
      } finally {
        setLoading(false);
      }
    }
    loadConfig();
  }, []);

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col h-screen items-center justify-center bg-gray-50 p-6 text-center space-y-4">
        <div className="w-16 h-16 bg-red-100 text-red-500 rounded-full flex items-center justify-center">
          <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>
        <h2 className="text-xl font-bold text-gray-900">Error de conexión</h2>
        <p className="text-gray-500">No hemos podido conectar con la base de datos de la carta. Por favor, revisa tu conexión a internet o intenta recargar.</p>
        <button
          onClick={() => window.location.reload()}
          className="mt-4 px-6 py-2 bg-gray-900 text-white rounded-full font-medium active:scale-95 transition-transform"
        >
          Reintentar
        </button>
      </div>
    );
  }

  return (
    <div className="relative h-screen w-full bg-black flex flex-col justify-end overflow-hidden">
      {/* Background Image */}
      {config?.imagen_portada_url ? (
        <img
          src={config.imagen_portada_url}
          alt="Portada"
          className="absolute inset-0 w-full h-full object-cover opacity-60"
        />
      ) : (
        <div className="absolute inset-0 w-full h-full bg-gray-800" />
      )}

      {/* Gradient Overlay for Text Readability */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />

      {/* Content */}
      <div className="relative z-10 p-8 flex flex-col items-center text-center pb-24">
        {config?.logotipo_url && (
          <img
            src={config.logotipo_url}
            alt={config.nombre_restaurante}
            className="w-40 h-40 object-contain mb-8 rounded-2xl shadow-2xl bg-white/10 backdrop-blur-sm p-4"
          />
        )}

        <h1 className="text-4xl font-bold text-white mb-2 drop-shadow-md">
          {config?.nombre_restaurante || 'Carta Digital'}
        </h1>
        <p className="text-gray-300 mb-10">Descubre nuestra selección</p>

        <button
          onClick={() => navigate('/familias')}
          className="w-full max-w-xs bg-primary text-white py-4 rounded-full font-semibold text-lg shadow-lg transform transition active:scale-95 hover:opacity-90"
          style={{ backgroundColor: config?.color_principal || '#000000' }}
        >
          Ver Carta
        </button>
      </div>
    </div>
  );
}