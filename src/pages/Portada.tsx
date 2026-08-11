import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { X, BookOpen, Phone, CalendarDays } from 'lucide-react';
import { api } from '../services/api';
import type { Configuracion, Producto } from '../types/database';

// La portada aprobada se conserva como referencia oficial en el repositorio.
// Se sirve directamente desde GitHub porque el archivo original está en docs/REFERENCIAS/PUBLICO.
const PORTADA_IMAGE = 'https://raw.githubusercontent.com/decelife25-cyber/CartaDigitalQR/main/docs/REFERENCIAS/PUBLICO/portada.png?v=1';
// La pizarra está en docs/REFERENCIAS/ICONOS; no se debe tratar como /pizarra.png del sitio.
const PIZARRA_IMAGE = 'https://raw.githubusercontent.com/decelife25-cyber/CartaDigitalQR/main/docs/REFERENCIAS/ICONOS/pizarra.png?v=1';

export default function Portada() {
  const navigate = useNavigate();
  const [config, setConfig] = useState<Configuracion | null>(null);
  const [sugerencias, setSugerencias] = useState<Producto[]>([]);
  const [loading, setLoading] = useState(true);
  const [pizarraAmpliada, setPizarraAmpliada] = useState(false);

  useEffect(() => {
    Promise.all([api.getConfiguracion(), api.getSugerencias()]).then(([data, productos]) => {
      if (data?.color_principal) document.documentElement.style.setProperty('--color-primary', data.color_principal);
      setConfig(data);
      setSugerencias(productos);
      setLoading(false);
    });
  }, []);

  if (loading) return <div className="flex h-[100dvh] w-full items-center justify-center bg-black text-white">Cargando...</div>;

  const phone = config?.telefono?.trim();

  const salirDePortada = () => {
    if (window.history.length > 1) {
      navigate(-1);
    } else {
      navigate('/familias', { replace: true });
    }
  };

  return (
    <main className="relative h-[100dvh] w-full overflow-hidden bg-black">
      <img
        src={PORTADA_IMAGE}
        alt="Taberna Camborio"
        className="absolute inset-0 h-full w-full object-cover"
      />
      <div className="absolute inset-0 bg-gradient-to-b from-black/10 via-black/5 to-black/60" />

      {sugerencias.length > 0 && (
        <button
          type="button"
          onClick={() => setPizarraAmpliada((actual) => !actual)}
          aria-label={pizarraAmpliada ? 'Reducir sugerencias del día' : 'Ampliar sugerencias del día'}
          aria-pressed={pizarraAmpliada}
          className={[
            'absolute z-20 m-0 border-0 bg-transparent p-0 text-left transition-all duration-300 ease-out',
            'focus:outline-none focus-visible:ring-2 focus-visible:ring-white/80',
            pizarraAmpliada
              ? 'bottom-[145px] right-[4%] w-[min(78vw,360px)]'
              : 'bottom-[145px] right-[4%] w-[min(40vw,180px)]',
          ].join(' ')}
        >
          <div className="relative w-full drop-shadow-[0_8px_18px_rgba(0,0,0,.45)]">
            <img
              src={PIZARRA_IMAGE}
              alt="Pizarra de sugerencias del día"
              className="block h-auto w-full"
            />
            <div
              className="absolute left-[18%] right-[18%] top-[25%] bottom-[8%] flex flex-col gap-[clamp(4px,1.2vw,9px)] overflow-y-auto text-white [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
              style={{
                fontFamily: 'Segoe Print, Bradley Hand, Marker Felt, Comic Sans MS, cursive',
                textShadow: '0 1px 2px rgba(0,0,0,.85)',
              }}
            >
              {sugerencias.map((producto) => (
                <div
                  key={producto.id}
                  className="whitespace-normal text-[clamp(10px,2.4vw,16px)] font-semibold leading-[1.15]"
                >
                  - {producto.nombre}
                </div>
              ))}
            </div>
          </div>
        </button>
      )}

      <button
        type="button"
        onClick={salirDePortada}
        aria-label="Salir de la portada"
        className="absolute left-4 top-4 z-20 flex h-9 w-9 items-center justify-center rounded-full border border-white/30 bg-black/35 text-white/90 shadow-lg backdrop-blur-md active:scale-95"
      >
        <X size={20} strokeWidth={2.5} />
      </button>

      <div className="absolute inset-x-0 bottom-0 z-10 px-4 pb-[max(1rem,env(safe-area-inset-bottom))] pt-10">
        <div className="mx-auto grid w-full max-w-lg grid-cols-4 gap-2">
          <button
            type="button"
            onClick={() => phone ? (window.location.href = `tel:${phone}`) : undefined}
            className="col-span-1 flex h-12 min-w-0 items-center justify-center gap-1 rounded-xl border border-white/30 bg-black/55 px-1.5 text-[11px] font-bold leading-tight text-white shadow-lg backdrop-blur active:scale-[.99]"
          >
            <CalendarDays size={17} className="shrink-0" />
            <span>Reservar mesa</span>
          </button>

          <button
            type="button"
            onClick={() => navigate('/familias')}
            className="col-span-2 flex h-12 min-w-0 items-center justify-center gap-2 rounded-xl border border-white/30 bg-black/55 px-3 text-[11px] font-bold leading-tight text-white shadow-lg backdrop-blur active:scale-[.99]"
          >
            <BookOpen size={17} className="shrink-0" />
            <span>Ver carta</span>
          </button>

          <button
            type="button"
            onClick={() => phone ? (window.location.href = `tel:${phone}`) : undefined}
            className="col-span-1 flex h-12 min-w-0 items-center justify-center gap-1 rounded-xl border border-white/30 bg-black/55 px-1.5 text-[11px] font-bold leading-tight text-white shadow-lg backdrop-blur active:scale-[.99]"
          >
            <Phone size={17} className="shrink-0" />
            <span>Llamar</span>
          </button>
        </div>
      </div>
    </main>
  );
}
