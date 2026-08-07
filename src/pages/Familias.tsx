import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import type { Familia } from '../types/database';

export default function Familias() {
  const navigate = useNavigate();
  const [familias, setFamilias] = useState<Familia[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadFamilias() {
      try {
        const data = await api.getFamilias();
        setFamilias(data);
      } finally {
        setLoading(false);
      }
    }
    loadFamilias();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-full pt-20">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="p-4 pt-6 space-y-6">
      <h1 className="text-2xl font-bold text-gray-900 px-2">Nuestra Carta</h1>

      <div className="grid grid-cols-2 gap-4">
        {familias.map((familia) => (
          <button
            key={familia.id}
            onClick={() => navigate(`/familias/${familia.id}`)}
            className="group relative flex flex-col items-center p-4 bg-white rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-all active:scale-95 overflow-hidden aspect-square justify-center text-center"
          >
            {familia.imagen_url ? (
              <img
                src={familia.imagen_url}
                alt={familia.nombre}
                className="absolute inset-0 w-full h-full object-cover opacity-20 group-hover:opacity-30 transition-opacity"
              />
            ) : (
              <div className="absolute inset-0 w-full h-full bg-gradient-to-br from-gray-50 to-gray-100" />
            )}

            <div className="relative z-10 font-semibold text-gray-800 text-lg shadow-white drop-shadow-md">
              {familia.nombre}
            </div>
          </button>
        ))}
      </div>

      {familias.length === 0 && (
        <p className="text-center text-gray-500 mt-10">
          No hay categorías disponibles en este momento.
        </p>
      )}
    </div>
  );
}