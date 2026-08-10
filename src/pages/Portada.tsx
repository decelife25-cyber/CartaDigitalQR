import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, BookOpen, Phone, CalendarDays } from 'lucide-react';
import { api } from '../services/api';
import type { Configuracion } from '../types/database';

// La portada aprobada se conserva como referencia oficial en el repositorio.
// Se sirve directamente desde GitHub porque el archivo original está en docs/REFERENCIAS/PUBLICO.
const PORTADA_IMAGE = 'https://raw.githubusercontent.com/decelife25-cyber/CartaDigitalQR/main/docs/REFERENCIAS/PUBLICO/portada.png?v=1';

export default function Portada() {
  const navigate = useNavigate();
  const [config, setConfig] = useState<Configuracion | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getConfiguracion().then((data) => {
      if (data?.color_principal) document.documentElement.style.setProperty('--color-primary', data.color_principal);
      setConfig(data);
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

      <button
        type="button"
        onClick={salirDePortada}
        aria-label="Salir de la portada"
        className="absolute left-4 top-4 z-20 flex h-9 w-9 items-center justify-center rounded-full border border-white/30 bg-black/35 text-white/90 shadow-lg backdrop-blur-md active:scale-95"
      >
        <ArrowLeft size={20} strokeWidth={2.5} />
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
