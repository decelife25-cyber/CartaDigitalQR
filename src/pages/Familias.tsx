import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import type { Familia } from '../types/database';

export default function Familias() {
  const navigate = useNavigate();
  const [familias, setFamilias] = useState<Familia[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    async function loadFamilias() {
      try {
        const data = await api.getFamilias();
        // Since api.getFamilias returns [] on error/empty, we need to differentiate if needed,
        // but for now if it's strictly an API crash we might still get [] from the try-catch block.
        // We will assume that if data is undefined (shouldn't happen with our fallback) it's an error.
        if (data) {
          setFamilias(data);
        } else {
          setError(true);
        }
      } catch {
         setError(true);
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

  if (error) {
    return (
       <div className="p-4 pt-10 text-center">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-red-100 text-red-500 mb-4">
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>
        <p className="text-gray-500 font-medium">No se han podido cargar las categorías.</p>
        <button
          onClick={() => window.location.reload()}
          className="mt-4 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-200 transition-colors"
        >
          Reintentar
        </button>
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

      {familias.length === 0 && !error && (
        <div className="text-center py-10 px-4 bg-white rounded-xl border border-gray-100 mt-4">
          <p className="text-gray-500 font-medium">No hay categorías disponibles en este momento.</p>
        </div>
      )}
    </div>
  );
}