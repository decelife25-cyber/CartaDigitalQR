import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Trash2, Share2, Copy, Check, ClipboardList } from 'lucide-react';
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
      if (selectedIds.length === 0) { setProductos([]); setLoading(false); return; }
      setLoading(true);
      try { setProductos(await api.getProductosByIds(selectedIds)); }
      finally { setLoading(false); }
    }
    void loadSelectedProducts();
  }, [selectedIds]);

  const total = productos.reduce((sum, p) => sum + p.precio, 0);
  const generateTextFormat = () => `Mi selección de Carta Digital:\n\n${productos.map(p => `- ${p.nombre} (${p.precio.toFixed(2)}€)`).join('\n')}\n\nTotal estimado: ${total.toFixed(2)}€`;

  const handleCopy = async () => {
    await navigator.clipboard.writeText(generateTextFormat());
    setCopied(true);
    window.setTimeout(() => setCopied(false), 2000);
  };

  const handleShare = async () => {
    if (navigator.share) {
      try { await navigator.share({ title: 'Mi selección', text: generateTextFormat() }); }
      catch (err) { console.log('Error sharing', err); }
    } else await handleCopy();
  };

  const handleClear = () => {
    if (window.confirm('¿Vaciar toda la selección?')) clearSelection();
  };

  if (loading) return <div className="flex min-h-full items-center justify-center" style={{ background: 'var(--app-bg)' }}><div className="h-7 w-7 animate-spin rounded-full border-2 border-current border-t-transparent opacity-50" /></div>;

  if (productos.length === 0) {
    return (
      <main className="flex min-h-full flex-col items-center justify-center px-6 pb-10 text-center" style={{ background: 'var(--app-bg)', color: 'var(--app-text)' }}>
        <div className="mb-5 flex h-20 w-20 items-center justify-center rounded-full" style={{ background: 'var(--app-surface)', border: '1px solid var(--app-border)' }}><ClipboardList className="h-9 w-9" style={{ color: 'var(--app-muted)' }} /></div>
        <h1 className="text-2xl font-extrabold">Mi selección está vacía</h1>
        <p className="mt-2 max-w-xs text-sm leading-5" style={{ color: 'var(--app-muted)' }}>Añade los platos que te gusten y tendrás tu lista preparada para enseñársela al camarero.</p>
        <button type="button" onClick={() => navigate('/familias')} className="mt-6 h-12 w-full max-w-xs rounded-xl bg-primary px-5 text-sm font-extrabold text-white shadow-md active:scale-[.99]">Ver carta</button>
      </main>
    );
  }

  return (
    <main className="min-h-full px-3 pb-4 pt-4" style={{ background: 'var(--app-bg)', color: 'var(--app-text)' }}>
      <div className="mb-3 flex items-center justify-between px-1">
        <div><p className="text-[11px] font-bold uppercase tracking-[0.18em]" style={{ color: 'var(--app-muted)' }}>Carta</p><h1 className="mt-0.5 text-2xl font-extrabold tracking-tight">Mi selección</h1></div>
        <button type="button" onClick={handleClear} className="rounded-lg px-2.5 py-2 text-xs font-bold text-red-500">Vaciar selección</button>
      </div>

      <div className="space-y-2 pb-3">
        {productos.map((producto) => (
          <article key={producto.id} className="flex min-h-[92px] items-center gap-3 rounded-2xl border p-2 shadow-sm" style={{ background: 'var(--app-surface)', borderColor: 'var(--app-border)' }}>
            {producto.foto_url ? <img src={producto.foto_url} alt="" className="h-20 w-20 shrink-0 rounded-xl object-cover" /> : <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-xl text-[10px]" style={{ background: 'var(--app-surface-soft)', color: 'var(--app-muted)' }}>Sin imagen</div>}
            <div className="min-w-0 flex-1 py-1"><h2 className="line-clamp-2 text-base font-extrabold leading-tight">{producto.nombre}</h2><p className="mt-1 text-sm font-extrabold" style={{ color: 'var(--color-primary)' }}>{producto.precio.toFixed(2)}€</p></div>
            <button type="button" onClick={() => removeSelection(producto.id)} className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full" style={{ color: 'var(--app-muted)' }} aria-label={`Eliminar ${producto.nombre}`}><Trash2 className="h-5 w-5" /></button>
          </article>
        ))}
      </div>

      <section className="sticky bottom-0 rounded-2xl border p-3 shadow-lg backdrop-blur" style={{ background: 'color-mix(in srgb, var(--app-surface) 94%, transparent)', borderColor: 'var(--app-border)' }}>
        <div className="mb-3 flex items-center justify-between"><span className="text-sm font-semibold" style={{ color: 'var(--app-muted)' }}>Total de la selección</span><strong className="text-2xl font-extrabold">{total.toFixed(2)}€</strong></div>
        <button type="button" onClick={handleShare} className="mb-2 flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-primary text-sm font-extrabold text-white shadow-md active:scale-[.99]"><Share2 className="h-5 w-5" />Mostrar al camarero</button>
        <div className="grid grid-cols-2 gap-2"><button type="button" onClick={handleCopy} className="flex h-10 items-center justify-center gap-1.5 rounded-xl border text-xs font-bold" style={{ background: 'var(--app-surface-soft)', borderColor: 'var(--app-border)' }}>{copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}{copied ? '¡Copiado!' : 'Copiar'}</button><button type="button" onClick={() => navigate('/familias')} className="h-10 rounded-xl border text-xs font-bold" style={{ background: 'var(--app-surface-soft)', borderColor: 'var(--app-border)' }}>Volver a la carta</button></div>
      </section>
    </main>
  );
}
