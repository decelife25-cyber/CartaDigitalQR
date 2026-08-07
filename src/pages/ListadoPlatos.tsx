import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import type { Producto, Familia } from '../types/database';

export default function ListadoPlatos() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [productos, setProductos] = useState<Producto[]>([]);
  const [familia, setFamilia] = useState<Familia | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    async function loadData() {
      if (!id) return;
      try {
        const [productosData, familiasData] = await Promise.all([
          api.getProductosByFamilia(id),
          api.getFamilias()
        ]);

        if (productosData && familiasData) {
          setProductos(productosData);
          const currentFamilia = familiasData.find(f => f.id === id);
          if (currentFamilia) setFamilia(currentFamilia);
        } else {
          setError(true);
        }
      } catch {
        setError(true);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [id]);

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
        <p className="text-red-500 font-medium mb-4">No hemos podido cargar los platos.</p>
        <button
          onClick={() => window.location.reload()}
          className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-200 transition-colors"
        >
          Reintentar
        </button>
      </div>
    );
  }

  return (
    <div className="p-4 pt-6 space-y-6">
      <h1 className="text-2xl font-bold text-gray-900 px-2 capitalize">
        {familia?.nombre || 'Platos'}
      </h1>

      <div className="space-y-4">
        {productos.map((producto) => (
          <div
            key={producto.id}
            onClick={() => navigate(`/plato/${producto.id}`)}
            className="flex bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden cursor-pointer hover:shadow-md transition-shadow"
          >
            {producto.imagen_url ? (
              <img
                src={producto.imagen_url}
                alt={producto.nombre}
                className="w-28 h-28 object-cover"
              />
            ) : (
              <div className="w-28 h-28 bg-gray-100 flex items-center justify-center">
                <span className="text-gray-400 text-xs">Sin imagen</span>
              </div>
            )}

            <div className="p-3 flex-1 flex flex-col justify-between">
              <div>
                <h3 className="font-semibold text-gray-900 line-clamp-1">{producto.nombre}</h3>
                <p className="text-sm text-gray-500 line-clamp-2 mt-1">
                  {producto.descripcion}
                </p>
              </div>

              <div className="flex justify-between items-center mt-2">
                <span className="font-bold text-primary">
                  {producto.precio.toFixed(2)}€
                </span>

                {/* Allergen Icons */}
                {producto.alergenos && producto.alergenos.length > 0 && (
                  <div className="flex gap-1">
                    {producto.alergenos.map((alergeno) => (
                      alergeno.icono_url ? (
                        <img
                          key={alergeno.id}
                          src={alergeno.icono_url}
                          alt={alergeno.nombre}
                          title={alergeno.nombre}
                          className="w-5 h-5 object-contain"
                        />
                      ) : null
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {productos.length === 0 && (
        <div className="text-center py-10 px-4 bg-white rounded-xl border border-gray-100 mt-4">
          <p className="text-gray-500 font-medium">No hay productos disponibles en esta categoría.</p>
        </div>
      )}
    </div>
  );
}