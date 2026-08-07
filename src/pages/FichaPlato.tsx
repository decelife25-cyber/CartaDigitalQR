import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Heart } from 'lucide-react';
import { api } from '../services/api';
import type { Producto } from '../types/database';
import { useSelectionStore } from '../store/selectionStore';
import { clsx } from 'clsx';

export default function FichaPlato() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [producto, setProducto] = useState<Producto | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  // Zustand Store
  const { isSelected, addSelection, removeSelection } = useSelectionStore();

  useEffect(() => {
    async function loadData() {
      if (!id) return;
      try {
        const data = await api.getProductoById(id);
        if (data) {
           setProducto(data);
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

  if (error || !producto) {
    return (
      <div className="p-8 text-center text-gray-500 mt-10">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-red-50 text-red-500 mb-4">
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </div>
        <p className="font-medium text-gray-800">Producto no encontrado</p>
        <p className="text-sm mt-1 mb-6">El producto que buscas no existe o ha sido eliminado.</p>
        <button onClick={() => navigate(-1)} className="text-white bg-primary px-6 py-2 rounded-lg font-medium w-full shadow-sm" style={{ backgroundColor: 'var(--color-primary)' }}>
          Volver a la carta
        </button>
      </div>
    );
  }

  const selected = isSelected(producto.id);

  const toggleSelection = () => {
    if (selected) {
      removeSelection(producto.id);
    } else {
      addSelection(producto.id);
    }
  };

  return (
    <div className="bg-white min-h-full pb-8">
      {/* Product Image Header */}
      <div className="w-full aspect-video bg-gray-100 relative">
        {producto.imagen_url ? (
          <img
            src={producto.imagen_url}
            alt={producto.nombre}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-gray-400">
            Sin imagen
          </div>
        )}
      </div>

      <div className="p-5 space-y-6">
        {/* Title and Price */}
        <div className="flex justify-between items-start gap-4">
          <h1 className="text-2xl font-bold text-gray-900 leading-tight">
            {producto.nombre}
          </h1>
          <span className="text-2xl font-bold text-primary shrink-0">
            {producto.precio.toFixed(2)}€
          </span>
        </div>

        {/* Description */}
        {producto.descripcion && (
          <p className="text-gray-600 leading-relaxed text-[15px]">
            {producto.descripcion}
          </p>
        )}

        {/* Allergens Section */}
        {producto.alergenos && producto.alergenos.length > 0 && (
          <div className="pt-4 border-t border-gray-100">
            <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3">
              Alérgenos
            </h3>
            <div className="flex flex-wrap gap-3">
              {producto.alergenos.map((alergeno) => (
                <div key={alergeno.id} className="flex items-center gap-2 bg-gray-50 px-3 py-1.5 rounded-full border border-gray-100">
                  {alergeno.icono_url && (
                    <img
                      src={alergeno.icono_url}
                      alt={alergeno.nombre}
                      className="w-5 h-5 object-contain"
                    />
                  )}
                  <span className="text-sm font-medium text-gray-600">{alergeno.nombre}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Action Button */}
        <div className="pt-6">
          <button
            onClick={toggleSelection}
            className={clsx(
              "w-full flex items-center justify-center gap-2 py-4 rounded-xl font-semibold text-lg transition-all shadow-md active:scale-95",
              selected
                ? "bg-red-50 text-red-500 border-2 border-red-200"
                : "bg-primary text-white border-2 border-transparent"
            )}
            style={!selected ? { backgroundColor: 'var(--color-primary)' } : {}}
          >
            <Heart className={clsx("w-6 h-6", selected && "fill-current")} />
            {selected ? 'Quitar de mi selección' : 'Añadir a mi selección'}
          </button>
        </div>
      </div>
    </div>
  );
}