import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { X, BookOpen, Phone, CalendarDays, Clock3, LoaderCircle } from 'lucide-react';
import { api } from '../services/api';
import { supabase } from '../lib/supabase';
import type { Configuracion, Producto } from '../types/database';

const DEFAULT_PORTADA_IMAGE = `${import.meta.env.VITE_SUPABASE_URL}/storage/v1/object/public/productos/publico/portada.png`;
const PIZARRA_IMAGE = `${import.meta.env.VITE_SUPABASE_URL}/storage/v1/object/public/productos/publico/pizarra.png?v=20260818-2`;

type PortadaProgramada = { id: string; image_url: string; activa: boolean; programada_desde: string | null; programada_hasta: string | null };
function portadaProgramadaAhora(portada: PortadaProgramada, now: number) { const from = portada.programada_desde ? new Date(portada.programada_desde).getTime() : null; const until = portada.programada_hasta ? new Date(portada.programada_hasta).getTime() : null; return (from !== null || until !== null) && (from === null || now >= from) && (until === null || now <= until); }

export default function Portada() {
  const navigate = useNavigate();
  const [config, setConfig] = useState<Configuracion | null>(null);
  const [sugerencias, setSugerencias] = useState<Producto[]>([]);
  const [portadaProgramada, setPortadaProgramada] = useState<PortadaProgramada | null>(null);
  const [loading, setLoading] = useState(true);
  const [reservandoMesa, setReservandoMesa] = useState(false);
  const [pizarraAmpliada, setPizarraAmpliada] = useState(false);
  const [horarioAbierto, setHorarioAbierto] = useState(false);
  const textoPizarraRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => { let cancelled = false; Promise.all([api.getConfiguracion(), api.getSugerencias()]).then(async ([data, productos]) => { if (cancelled) return; if (data?.color_principal) document.documentElement.style.setProperty('--color-primary', data.color_principal); setConfig(data); setSugerencias(productos); if (data?.id) { const { data: portadas } = await supabase.from('portadas_carta').select('id,image_url,activa,programada_desde,programada_hasta').eq('configuracion_id', data.id); if (!cancelled && portadas) { const now = Date.now(); const scheduled = (portadas as PortadaProgramada[]).filter(item => portadaProgramadaAhora(item, now)).sort((a,b) => new Date(b.programada_desde ?? 0).getTime() - new Date(a.programada_desde ?? 0).getTime()); setPortadaProgramada(scheduled[0] ?? null); } } if (!cancelled) setLoading(false); }).catch(() => { if (!cancelled) setLoading(false); }); return () => { cancelled = true; }; }, []);

  useEffect(() => { const timer = window.setInterval(() => { if (!config?.id) return; void (async () => { const { data } = await supabase.from('portadas_carta').select('id,image_url,activa,programada_desde,programada_hasta').eq('configuracion_id', config.id); if (!data) return; const now = Date.now(); const scheduled = (data as PortadaProgramada[]).filter(item => portadaProgramadaAhora(item, now)).sort((a,b) => new Date(b.programada_desde ?? 0).getTime() - new Date(a.programada_desde ?? 0).getTime()); setPortadaProgramada(scheduled[0] ?? null); })(); }, 60_000); return () => window.clearInterval(timer); }, [config?.id]);
  useEffect(() => { const reset = () => setReservandoMesa(false); window.addEventListener('pageshow', reset); return () => window.removeEventListener('pageshow', reset); }, []);

  useLayoutEffect(() => {
    const element = textoPizarraRef.current;
    if (!element || sugerencias.length === 0) return;
    let frame = 0;
    let cancelled = false;
    const fitText = () => { cancelAnimationFrame(frame); frame = requestAnimationFrame(() => { if (cancelled) return; const maxSize = pizarraAmpliada ? 26 : 16; const minSize = 7; const step = 0.25; element.style.fontSize = `${maxSize}px`; let size = maxSize; while (size > minSize && element.scrollHeight > element.clientHeight) { size -= step; element.style.fontSize = `${size}px`; } element.scrollTop = 0; }); };
    fitText();
    const observer = new ResizeObserver(fitText); observer.observe(element);
    const fontReady = document.fonts?.ready.then(() => fitText());
    const delayed = window.setTimeout(fitText, 150);
    return () => { cancelled = true; cancelAnimationFrame(frame); observer.disconnect(); window.clearTimeout(delayed); void fontReady; };
  }, [sugerencias, pizarraAmpliada]);

  if (loading) return <div className="flex h-[100dvh] w-full items-center justify-center bg-black text-white">Cargando...</div>;
  const phone = config?.telefono?.trim(); const direccion = config?.direccion?.trim(); const horario = config?.horario?.trim(); const urlReservasMesa = config?.url_reservas_mesa?.trim(); const portadaImage = portadaProgramada?.image_url?.trim() || config?.portada_url?.trim() || DEFAULT_PORTADA_IMAGE;
  const salirDePortada = () => { if (window.history.length > 1) navigate(-1); else navigate('/familias', { replace: true }); };
  const reservarMesa = () => { if (!urlReservasMesa || reservandoMesa) return; try { const url = new URL(urlReservasMesa, window.location.origin); if (url.protocol !== 'http:' && url.protocol !== 'https:') return; setReservandoMesa(true); window.setTimeout(() => window.location.assign(url.href), 80); } catch { /* URL no valida. */ } };

  return <main className="relative h-[100dvh] w-full overflow-hidden bg-black">
    <img src={portadaImage} alt="Taberna Camborio" className="absolute inset-0 h-full w-full object-cover" />
    <div className="absolute inset-0 bg-gradient-to-b from-black/10 via-black/5 to-black/60" />
    {sugerencias.length > 0 && <button type="button" onClick={() => setPizarraAmpliada(actual => !actual)} aria-label={pizarraAmpliada ? 'Reducir sugerencias del día' : 'Ampliar sugerencias del día'} aria-pressed={pizarraAmpliada} className={['absolute z-20 m-0 border-0 bg-transparent p-0 text-left transition-all duration-300 ease-out','focus:outline-none focus-visible:ring-2 focus-visible:ring-white/80',pizarraAmpliada ? 'bottom-[205px] right-[4%] w-[min(78vw,360px)]' : 'bottom-[100px] right-[4%] w-[min(34vw,155px)]'].join(' ')}><div className="relative w-full drop-shadow-[0_8px_18px_rgba(0,0,0,.45)]"><img src={PIZARRA_IMAGE} alt="Pizarra de sugerencias del día" className="block h-auto w-full" /><div ref={textoPizarraRef} className="absolute left-[18%] right-[18%] top-[25%] bottom-[8%] flex flex-col gap-[clamp(4px,1.2vw,9px)] overflow-hidden text-white" style={{ fontFamily: '"Patrick Hand SC", "Chalkboard SE", "Marker Felt", "Segoe Print", cursive', fontSize: pizarraAmpliada ? '26px' : '16px', lineHeight: 1.12, letterSpacing: '0.025em', textTransform: 'uppercase', textShadow: '0 1px 2px rgba(0,0,0,.9)' }}>{sugerencias.map(producto => <div key={producto.id} className="flex min-w-0 shrink-0 items-start font-normal"><span className="mr-[0.45em] shrink-0">-</span><span className="min-w-0 break-words">{producto.nombre}</span></div>)}</div></div></button>}
    <button type="button" onClick={salirDePortada} aria-label="Salir de la portada" className="absolute left-4 top-4 z-20 flex h-9 w-9 items-center justify-center rounded-full border border-white/30 bg-black/35 text-white/90 shadow-lg backdrop-blur-md active:scale-95"><X size={20} strokeWidth={2.5} /></button>
    {horario && <button type="button" onClick={() => setHorarioAbierto(true)} aria-label="Ver horario del restaurante" title="Horario" className="absolute right-4 top-4 z-20 flex h-9 w-9 items-center justify-center rounded-full border border-white/30 bg-black/35 text-white/90 shadow-lg backdrop-blur-md active:scale-95"><Clock3 size={19} strokeWidth={2.4} /></button>}
    <div className="absolute inset-x-0 bottom-0 z-30 px-4 pb-2"><div className="mx-auto w-full max-w-lg"><div className="grid w-full grid-cols-10 gap-2"><button type="button" onClick={reservarMesa} disabled={!urlReservasMesa || reservandoMesa} aria-label={urlReservasMesa ? 'Reservar mesa' : 'Reservar mesa no configurado'} aria-busy={reservandoMesa} className="col-span-3 flex h-12 min-w-0 items-center justify-center gap-1 rounded-xl border border-white/30 bg-black/55 px-1.5 text-[11px] font-bold leading-tight text-white shadow-lg backdrop-blur transition-transform active:scale-[.96] disabled:cursor-not-allowed disabled:opacity-60">{reservandoMesa ? <LoaderCircle size={17} className="shrink-0 animate-spin" /> : <CalendarDays size={17} className="shrink-0" />}<span>{reservandoMesa ? 'Cargando...' : 'Reservar mesa'}</span></button><button type="button" onClick={() => navigate('/familias')} className="col-span-4 flex h-12 min-w-0 items-center justify-center gap-2 rounded-xl border border-white/30 bg-black/55 px-3 text-[11px] font-bold leading-tight text-white shadow-lg backdrop-blur active:scale-[.99]"><BookOpen size={17} className="shrink-0" /><span>Ver carta</span></button><button type="button" onClick={() => phone ? (window.location.href = `tel:${phone}`) : undefined} className="col-span-3 flex h-12 min-w-0 items-center justify-center gap-1 rounded-xl border border-white/30 bg-black/55 px-1.5 text-[11px] font-bold leading-tight text-white shadow-lg backdrop-blur active:scale-[.99]"><Phone size={17} className="shrink-0" /><span>Llamar</span></button></div>{(direccion || phone) && <div className="mt-2 whitespace-nowrap rounded-lg bg-black/35 px-2 py-1 text-center text-[10px] font-semibold leading-tight text-white shadow-sm backdrop-blur-sm">{direccion && <span>{direccion}</span>}{direccion && phone && <span className="mx-2">|</span>}{phone && <span>{phone}</span>}</div>}</div></div>
    {horarioAbierto && horario && <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/50 px-5 backdrop-blur-[2px]" role="dialog" aria-modal="true" aria-labelledby="horario-title" onMouseDown={event => { if (event.currentTarget === event.target) setHorarioAbierto(false); }}><section className="w-full max-w-sm rounded-3xl border border-white/20 bg-black/85 p-5 text-white shadow-2xl backdrop-blur-md"><div className="flex items-center justify-between gap-3"><div className="flex min-w-0 items-center gap-2.5"><span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/10"><Clock3 size={21} /></span><h2 id="horario-title" className="text-xl font-extrabold">Horario</h2></div><button type="button" onClick={() => setHorarioAbierto(false)} aria-label="Cerrar horario" className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white/10 text-white/90 active:scale-95"><X size={19} /></button></div><div className="mt-4 whitespace-pre-line rounded-2xl border border-white/10 bg-white/5 px-4 py-4 text-[16px] font-semibold leading-7 text-white/95">{horario}</div></section></div>}
    {reservandoMesa && <div role="status" aria-live="polite" className="absolute inset-0 z-50 flex items-center justify-center bg-black/45 px-6 backdrop-blur-[2px]"><div className="flex min-w-[220px] flex-col items-center justify-center rounded-2xl border border-white/20 bg-black/75 px-7 py-6 text-center text-white shadow-2xl backdrop-blur-md"><LoaderCircle size={34} strokeWidth={2.5} className="mb-3 animate-spin" /><span className="text-base font-bold">Cargando reserva de mesa...</span></div></div>}
  </main>;
}
