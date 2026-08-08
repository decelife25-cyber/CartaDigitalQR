import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Trash2, Share2, Copy, AlertCircle } from 'lucide-react';
import { api } from '../services/api';
import type { Producto } from '../types/database';
import { useSelectionStore } from '../store/selectionStore';

export default function MiSeleccion() {
  const navigate = useNavigate();
  const { selectedIds, removeSelection, clearSelection } = useSelectionStore();
  const [productos, setProductos] = useState<Producto[]>([]);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    async function loadSelectedProducts() {
      if (selectedIds.length === 0) {
        setProductos([]);
        setLoading(false);
        return;
      }

      setLoading(true);
      try {
        const data = await api.getProductosByIds(selectedIds);
        setProductos(data);
      } finally {
        setLoading(false);
      }
    }
    loadSelectedProducts();
  }, [selectedIds]);

  const total = productos.reduce((sum, p) => sum + p.precio, 0);

  const generateTextFormat = () => {
    let text = "Mi pedido de Carta Digital:\n\n";
    productos.forEach(p => {
      text += `- ${p.nombre} (${p.precio.toFixed(2)}€)\n`;
    });
    text += `\nTotal estimado: ${total.toFixed(2)}€\n`;
    return text;
  };

  const handleShare = async () => {
    const text = generateTextFormat();
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Mi Pedido',
          text: text,
        });
      } catch (err) {
        console.log('Error sharing', err);
      }
    } else {
      handleCopy();
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(generateTextFormat());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-full pt-20">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (productos.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-6 text-center space-y-4 pt-20">
        <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-2">
          <AlertCircle className="w-10 h-10 text-gray-400" />
        </div>
        <h2 className="text-xl font-bold text-gray-900">Tu selección está vacía</h2>
        <p className="text-gray-500">
          Navega por la carta y añade los platos que más te gusten para tenerlos a mano.
        </p>
        <button
          onClick={() => navigate('/familias')}
          className="mt-4 px-6 py-3 bg-primary text-white font-semibold rounded-full w-full max-w-xs shadow-md"
          style={{ backgroundColor: 'var(--color-primary)' }}
        >
          Ver Carta
        </button>
      </div>
    );
  }

  return (
    <div className="p-4 pt-6 pb-24 h-full flex flex-col">
      <div className="flex justify-between items-center mb-6 px-2">
        <h1 className="text-2xl font-bold text-gray-900">Mi Selección</h1>
        <button
          onClick={clearSelection}
          className="text-sm font-medium text-red-500 hover:text-red-700 bg-red-50 px-3 py-1.5 rounded-full"
        >
          Vaciar
        </button>
      </div>

      <div className="flex-1 overflow-y-auto space-y-4 mb-6 px-2">
        {productos.map((producto) => (
          <div key={producto.id} className="flex gap-4 items-center bg-white p-3 rounded-xl shadow-sm border border-gray-100">
            {producto.foto_url ? (
              <img
                src={producto.foto_url}
                alt={producto.nombre}
                className="w-20 h-20 rounded-lg object-cover"
              />
            ) : (
              <div className="w-20 h-20 rounded-lg bg-gray-100 flex items-center justify-center">
                <span className="text-gray-400 text-xs">Sin imagen</span>
              </div>
            )}

            <div className="flex-1">
              <h3 className="font-semibold text-gray-900 line-clamp-2 leading-tight">
                {producto.nombre}
              </h3>
              <p className="font-bold text-primary mt-1">
                {producto.precio.toFixed(2)}€
              </p>
            </div>

            <button
              onClick={() => removeSelection(producto.id)}
              className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors"
              aria-label="Eliminar"
            >
              <Trash2 className="w-5 h-5" />
            </button>
          </div>
        ))}
      </div>

      <div className="bg-white p-4 rounded-2xl shadow-lg border border-gray-100 mx-2 mt-auto">
        <div className="flex justify-between items-center mb-4">
          <span className="text-gray-600 font-medium">Total estimado</span>
          <span className="text-2xl font-bold text-gray-900">{total.toFixed(2)}€</span>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={handleCopy}
            className="flex items-center justify-center gap-2 py-3 bg-gray-100 text-gray-700 font-semibold rounded-xl hover:bg-gray-200 active:scale-95 transition-all"
          >
            <Copy className="w-5 h-5" />
            {copied ? '¡Copiado!' : 'Copiar'}
          </button>

          <button
            onClick={handleShare}
            className="flex items-center justify-center gap-2 py-3 bg-primary text-white font-semibold rounded-xl shadow-md active:scale-95 transition-all"
            style={{ backgroundColor: 'var(--color-primary)' }}
          >
            <Share2 className="w-5 h-5" />
            Compartir
          </button>
        </div>
      </div>
    </div>
  );
}
