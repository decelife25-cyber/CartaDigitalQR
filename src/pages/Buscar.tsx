import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search as SearchIcon, X, ChevronRight } from 'lucide-react';
import { api } from '../services/api';
import type { Producto } from '../types/database';
import { useDebounce } from '../hooks/useDebounce';

export default function Buscar() {
  const navigate = useNavigate();
  const inputRef = useRef<HTMLInputElement>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [results, setResults] = useState<Producto[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const debouncedSearchTerm = useDebounce(searchTerm, 300);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  useEffect(() => {
    async function performSearch() {
      const term = debouncedSearchTerm.trim();
      if (!term) {
        setResults([]);
        setHasSearched(false);
        setIsSearching(false);
        return;
      }
      setIsSearching(true);
      try {
        setResults(await api.buscarProductos(term));
        setHasSearched(true);
      } finally {
        setIsSearching(false);
      }
    }
    void performSearch();
  }, [debouncedSearchTerm]);

  return (
    <main className="min-h-full px-3 pb-5 pt-4" style={{ background: 'var(--app-bg)', color: 'var(--app-text)' }}>
      <div className="mb-3 px-1">
        <p className="text-[11px] font-bold uppercase tracking-[0.18em]" style={{ color: 'var(--app-muted)' }}>Carta</p>
        <h1 className="mt-0.5 text-2xl font-extrabold tracking-tight">Buscar plato</h1>
      </div>

      <div className="sticky top-0 z-10 pb-3" style={{ background: 'var(--app-bg)' }}>
        <div className="relative">
          <SearchIcon className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2" style={{ color: 'var(--app-muted)' }} />
          <input
            ref={inputRef}
            type="search"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar plato..."
            autoComplete="off"
            className="h-14 w-full rounded-2xl border bg-[var(--app-surface)] pl-12 pr-11 text-base font-medium outline-none transition focus:border-orange-400/70"
            style={{ borderColor: 'var(--app-border)', color: 'var(--app-text)', boxShadow: 'var(--app-shadow)' }}
          />
          {searchTerm && (
            <button type="button" onClick={() => { setSearchTerm(''); inputRef.current?.focus(); }} className="absolute right-3 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full" style={{ color: 'var(--app-muted)' }} aria-label="Borrar búsqueda">
              <X className="h-5 w-5" />
            </button>
          )}
        </div>
      </div>

      <section>
        {isSearching && (
          <div className="flex justify-center py-10"><div className="h-7 w-7 animate-spin rounded-full border-2 border-current border-t-transparent opacity-50" /></div>
        )}

        {!isSearching && !hasSearched && (
          <div className="flex flex-col items-center px-6 py-14 text-center" style={{ color: 'var(--app-muted)' }}>
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full" style={{ background: 'var(--app-surface)', border: '1px solid var(--app-border)' }}><SearchIcon className="h-7 w-7 opacity-50" /></div>
            <p className="text-base font-semibold">Busca cualquier plato</p>
            <p className="mt-1 text-sm">Escribe el nombre o una palabra relacionada.</p>
          </div>
        )}

        {!isSearching && hasSearched && results.length === 0 && (
          <div className="px-5 py-14 text-center" style={{ color: 'var(--app-muted)' }}>
            <p className="text-base font-semibold">No se han encontrado platos.</p>
            <p className="mt-1 text-sm">Prueba con otra palabra.</p>
          </div>
        )}

        {!isSearching && results.length > 0 && (
          <div className="space-y-2">
            <p className="px-1 pb-1 text-xs font-bold uppercase tracking-wider" style={{ color: 'var(--app-muted)' }}>
              {results.length} {results.length === 1 ? 'resultado' : 'resultados'}
            </p>
            {results.map((producto) => (
              <button
                key={producto.id}
                type="button"
                onClick={() => navigate(`/plato/${producto.id}`)}
                className="flex min-h-[88px] w-full items-center gap-3 rounded-2xl border p-2 text-left shadow-sm transition-transform active:scale-[.99]"
                style={{ background: 'var(--app-surface)', borderColor: 'var(--app-border)' }}
              >
                {producto.foto_url ? (
                  <img src={producto.foto_url} alt="" className="h-20 w-20 shrink-0 rounded-xl object-cover" />
                ) : (
                  <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-xl text-[10px]" style={{ background: 'var(--app-surface-soft)', color: 'var(--app-muted)' }}>Sin imagen</div>
                )}
                <div className="min-w-0 flex-1 py-1">
                  <h2 className="truncate text-base font-extrabold">{producto.nombre}</h2>
                  {producto.descripcion && <p className="mt-1 line-clamp-2 text-xs leading-4" style={{ color: 'var(--app-muted)' }}>{producto.descripcion}</p>}
                  <p className="mt-1 text-sm font-extrabold" style={{ color: 'var(--color-primary)' }}>{producto.precio.toFixed(2)}€</p>
                </div>
                <ChevronRight className="mr-1 h-5 w-5 shrink-0" style={{ color: 'var(--app-muted)' }} />
              </button>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
