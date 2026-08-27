import { useEffect, useRef, useState } from 'react';
import type { FormEvent } from 'react';
import { ChevronRight, Heart, ImageOff, Moon, Search, Sun, X } from 'lucide-react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { api } from '../services/api';
import type { Familia } from '../types/database';
import { useSelectionStore } from '../store/selectionStore';

const PIZARRA_IMAGE = `${import.meta.env.VITE_SUPABASE_URL}/storage/v1/object/public/productos/publico/pizarra.png`;

function toggleTheme() {
  const root = document.documentElement;
  const night = !root.classList.contains('theme-night');
  root.classList.toggle('theme-night', night);
  window.localStorage.setItem('carta-theme', night ? 'night' : 'day');
  window.dispatchEvent(new CustomEvent('carta-theme-change'));
}

export default function Familias() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const inputRef = useRef<HTMLInputElement>(null);
  const [familias, setFamilias] = useState<Familia[]>([]);
  const [loading, setLoading] = useState(true);
  const [night, setNight] = useState(() => document.documentElement.classList.contains('theme-night'));
  const [searchOpen, setSearchOpen] = useState(() => searchParams.get('buscar') === '1');
  const [searchTerm, setSearchTerm] = useState('');
  const selectedCount = useSelectionStore((state) => state.selectedIds.length);

  useEffect(() => {
    async function loadFamilias() {
      try {
        const data = await api.getFamilias();
        setFamilias(data);
      } finally {
        setLoading(false);
      }
    }
    void loadFamilias();

    const syncTheme = () => setNight(document.documentElement.classList.contains('theme-night'));
    window.addEventListener('carta-theme-change', syncTheme);
    return () => window.removeEventListener('carta-theme-change', syncTheme);
  }, []);

  useEffect(() => {
    if (!searchOpen) return;
    const timer = window.setTimeout(() => inputRef.current?.focus(), 80);
    return () => window.clearTimeout(timer);
  }, [searchOpen]);

  function closeSearch() {
    setSearchOpen(false);
    setSearchTerm('');
    if (searchParams.get('buscar') === '1') setSearchParams({}, { replace: true });
  }

  function submitSearch(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const term = searchTerm.trim();
    if (!term) {
      inputRef.current?.focus();
      return;
    }
    closeSearch();
    navigate(`/familias/buscar?q=${encodeURIComponent(term)}`);
  }

  if (loading) return <div className="flex min-h-[100dvh] items-center justify-center" style={{ background: 'var(--app-bg)' }}><div className="h-8 w-8 animate-spin rounded-full border-b-2 border-primary" /></div>;

  return (
    <main className="min-h-[100dvh] w-full" style={{ background: 'var(--app-bg)', color: 'var(--app-text)' }}>
      <div className="mx-auto w-full max-w-2xl">
        <header className="sticky top-0 z-20 flex min-h-[74px] items-center justify-between border-b px-4" style={{ background: 'var(--app-surface)', borderColor: 'var(--app-border)' }}>
          <div className="min-w-0"><p className="text-[10px] font-extrabold uppercase tracking-[0.2em]" style={{ color: 'var(--app-muted)' }}>Carta</p><h1 className="mt-0.5 text-[24px] font-extrabold leading-none tracking-tight">Familias</h1></div>
          <div className="flex shrink-0 items-center gap-1">
            <button type="button" onClick={() => setSearchOpen(true)} aria-label="Buscar artículos" title="Buscar artículos" className="flex h-10 w-10 items-center justify-center rounded-full border transition-transform active:scale-95" style={{ background: 'var(--app-surface)', borderColor: 'var(--app-border)', color: 'var(--app-text)' }}><Search size={20} strokeWidth={2.2} /></button>
            <button type="button" onClick={() => navigate('/sugerencias')} aria-label="Ver sugerencias" title="Sugerencias" className="flex h-10 w-10 items-center justify-center rounded-full border transition-transform active:scale-95" style={{ background: 'var(--app-surface)', borderColor: 'var(--app-border)' }}><img src={PIZARRA_IMAGE} alt="" className="h-7 w-7 object-contain" /></button>
            <button type="button" onClick={() => navigate('/seleccion')} aria-label={`Abrir mi selección${selectedCount ? ` (${selectedCount})` : ''}`} title="Mi selección" className="relative flex h-10 w-10 items-center justify-center rounded-full border transition-transform active:scale-95" style={{ background: 'var(--app-surface)', borderColor: 'var(--app-border)', color: 'var(--app-text)' }}><Heart size={20} strokeWidth={2.2} />{selectedCount > 0 && <span className="absolute right-0 top-0 flex h-4 min-w-4 items-center justify-center rounded-full px-1 text-[9px] font-extrabold text-white" style={{ background: '#e11d48' }}>{selectedCount}</span>}</button>
            <button type="button" onClick={toggleTheme} aria-label={night ? 'Cambiar a modo día' : 'Cambiar a modo noche'} title={night ? 'Modo día' : 'Modo noche'} className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border transition-transform active:scale-95" style={{ background: 'var(--app-surface)', borderColor: 'var(--app-border)', color: 'var(--app-text)' }}>{night ? <Sun size={20} strokeWidth={2.2} /> : <Moon size={20} strokeWidth={2.2} />}</button>
          </div>
        </header>

        <section aria-label="Familias de la carta">
          {familias.map((familia) => (
            <button key={familia.id} type="button" onClick={() => navigate(`/familias/${familia.id}`)} className="flex min-h-[72px] w-full items-center border-b text-left transition-colors active:brightness-95" style={{ background: 'var(--app-surface)', borderColor: 'var(--app-border)' }}>
              <div className="relative ml-3 h-[58px] w-[74px] shrink-0 overflow-hidden rounded-lg bg-stone-200">
                {familia.foto_url ? <img src={familia.foto_url} alt={`Foto de ${familia.nombre}`} className="h-full w-full object-cover" loading="lazy" /> : <div className="flex h-full w-full items-center justify-center" style={{ color: 'var(--app-muted)' }}><ImageOff size={22} strokeWidth={1.5} /></div>}
                <div className="absolute inset-0 bg-black/5" />
              </div>
              <div className="flex min-w-0 flex-1 items-center justify-between gap-2 px-3 py-2">
                <div className="min-w-0"><h2 className="text-[16px] font-extrabold leading-tight">{familia.nombre}</h2>{familia.descripcion && <p className="mt-0.5 line-clamp-1 text-[11px] leading-4" style={{ color: 'var(--app-muted)' }}>{familia.descripcion}</p>}</div>
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border" style={{ borderColor: 'var(--app-border)', color: 'var(--app-muted)', background: 'var(--app-surface-soft)' }}><ChevronRight className="h-4 w-4" strokeWidth={2} /></span>
              </div>
            </button>
          ))}
        </section>
        {familias.length === 0 && <div className="px-4 py-12 text-center" style={{ color: 'var(--app-muted)' }}><ImageOff className="mx-auto mb-3 h-8 w-8" strokeWidth={1.5} /><p className="text-sm">No hay familias disponibles en este momento.</p></div>}
      </div>

      {searchOpen && <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/45 px-3 pb-3 sm:items-center" role="dialog" aria-modal="true" aria-labelledby="search-title" onMouseDown={(event) => { if (event.currentTarget === event.target) closeSearch(); }}>
        <form onSubmit={submitSearch} className="w-full max-w-2xl overflow-hidden rounded-3xl border p-4 shadow-2xl" style={{ background: 'var(--app-surface)', borderColor: 'var(--app-border)' }}>
          <div className="mb-4 flex items-center justify-between gap-3"><div><p className="text-[10px] font-extrabold uppercase tracking-[0.2em]" style={{ color: 'var(--app-muted)' }}>Carta</p><h2 id="search-title" className="mt-1 text-xl font-extrabold">Buscar artículos</h2></div><button type="button" onClick={closeSearch} aria-label="Cerrar búsqueda" className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border" style={{ borderColor: 'var(--app-border)', color: 'var(--app-muted)' }}><X className="h-5 w-5" /></button></div>
          <div className="relative"><Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2" style={{ color: 'var(--app-muted)' }} /><input ref={inputRef} value={searchTerm} onChange={(event) => setSearchTerm(event.target.value)} type="search" inputMode="search" autoComplete="off" placeholder="Atún, choco, gambas..." aria-label="Buscar artículos" className="h-14 w-full rounded-2xl border bg-transparent pl-12 pr-4 text-base font-semibold outline-none focus:ring-2 focus:ring-orange-400/30" style={{ borderColor: 'var(--app-border)', color: 'var(--app-text)' }} /></div>
          <button type="submit" disabled={!searchTerm.trim()} className="mt-3 h-12 w-full rounded-2xl text-sm font-extrabold transition-opacity disabled:cursor-not-allowed disabled:opacity-40" style={{ background: 'var(--color-primary)', color: '#fff' }}>Buscar</button>
        </form>
      </div>}
    </main>
  );
}
