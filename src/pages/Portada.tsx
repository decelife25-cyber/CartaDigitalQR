import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import type { Configuracion } from '../types/database';

export default function Portada() {
  const navigate = useNavigate();
  const [config, setConfig] = useState<Configuracion | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadConfig() {
      try {
        const data = await api.getConfiguracion();
        if (data) {
          setConfig(data);
          // Set dynamic primary color for Tailwind
          if (data.color_principal) {
            document.documentElement.style.setProperty('--color-primary', data.color_principal);
          }
        }
      } finally {
        setLoading(false);
      }
    }
    loadConfig();
  }, []);

  if (loading) {
    return <div className="flex h-screen items-center justify-center">Cargando...</div>;
  }

  return (
    <div className="relative h-screen w-full bg-black flex flex-col justify-end overflow-hidden">
      {/* Background Image Fallback (since no imagen_portada_url in official schema) */}
      <div className="absolute inset-0 w-full h-full bg-gray-800" />

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