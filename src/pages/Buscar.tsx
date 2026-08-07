import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search as SearchIcon, X } from 'lucide-react';
import { api } from '../services/api';
import type { Producto } from '../types/database';
import { useDebounce } from '../hooks/useDebounce'; // Will create this

export default function Buscar() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [results, setResults] = useState<Producto[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  const debouncedSearchTerm = useDebounce(searchTerm, 500);

  useEffect(() => {
    async function performSearch() {
      if (!debouncedSearchTerm.trim()) {
        setResults([]);
        setHasSearched(false);
        setIsSearching(false);
        return;
      }

      setIsSearching(true);
      try {
        const data = await api.buscarProductos(debouncedSearchTerm);
        setResults(data);
        setHasSearched(true);
      } finally {
        setIsSearching(false);
      }
    }

    performSearch();
  }, [debouncedSearchTerm]);

  return (
    <div className="p-4 pt-6 space-y-6 flex flex-col h-full">
      <h1 className="text-2xl font-bold text-gray-900 px-2">Buscar plato</h1>

      {/* Search Bar */}
      <div className="relative px-2">
        <div className="absolute inset-y-0 left-5 flex items-center pointer-events-none">
          <SearchIcon className="h-5 w-5 text-gray-400" />
        </div>
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Ej: Hamburguesa, Ensalada..."
          className="w-full bg-white border border-gray-200 text-gray-900 text-base rounded-2xl focus:ring-primary focus:border-primary block pl-12 pr-10 py-4 shadow-sm"
          autoFocus
        />
        {searchTerm && (
          <button
            onClick={() => setSearchTerm('')}
            className="absolute inset-y-0 right-5 flex items-center p-1 text-gray-400 hover:text-gray-600"
          >
            <X className="h-5 w-5" />
          </button>
        )}
      </div>

      {/* Results State */}
      <div className="flex-1 overflow-y-auto">
        {isSearching && (
          <div className="flex justify-center py-10">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        )}

        {!isSearching && hasSearched && results.length === 0 && (
          <div className="text-center py-10 text-gray-500">
            <p className="text-lg">No hemos encontrado ningún plato.</p>
            <p className="text-sm mt-1">Prueba con otra palabra.</p>
          </div>
        )}

        {!isSearching && !hasSearched && (
          <div className="text-center py-10 text-gray-400">
            <SearchIcon className="h-12 w-12 mx-auto mb-3 opacity-20" />
            <p>Escribe para buscar en nuestra carta</p>
          </div>
        )}

        {/* Results List */}
        {!isSearching && results.length > 0 && (
          <div className="space-y-3 px-2">
            <p className="text-sm font-medium text-gray-500 mb-2">
              {results.length} {results.length === 1 ? 'resultado' : 'resultados'}
            </p>
            {results.map((producto) => (
              <div
                key={producto.id}
                onClick={() => navigate(`/plato/${producto.id}`)}
                className="flex items-center gap-4 bg-white p-3 rounded-xl shadow-sm border border-gray-100 cursor-pointer active:bg-gray-50 transition-colors"
              >
                {producto.imagen_url ? (
                  <img
                    src={producto.imagen_url}
                    alt={producto.nombre}
                    className="w-16 h-16 rounded-lg object-cover"
                  />
                ) : (
                  <div className="w-16 h-16 rounded-lg bg-gray-100 flex items-center justify-center">
                    <span className="text-gray-400 text-[10px]">Sin imagen</span>
                  </div>
                )}

                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900 line-clamp-1">{producto.nombre}</h3>
                  <span className="font-bold text-primary text-sm block mt-1">
                    {producto.precio.toFixed(2)}€
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}