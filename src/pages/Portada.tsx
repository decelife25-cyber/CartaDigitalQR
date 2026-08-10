import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { BookOpen, Phone, CalendarDays } from 'lucide-react';
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

  if (loading) return <div className="flex h-screen items-center justify-center">Cargando...</div>;

  const phone = config?.telefono?.trim();

  return (
    <main className="relative h-[100dvh] w-full overflow-hidden bg-slate-900">
      <img
        src={PORTADA_IMAGE}
        alt="Taberna Camborio"
        className="absolute inset-0 h-full w-full object-cover"
      />
      <div className="absolute inset-0 bg-gradient-to-b from-black/10 via-black/5 to-black/60" />

      <div className="absolute inset-x-0 bottom-0 z-10 px-5 pb-[max(1rem,env(safe-area-inset-bottom))] pt-12">
        <div className="mx-auto flex w-full max-w-sm flex-col gap-2">
          <button
            type="button"
            onClick={() => navigate('/familias')}
            className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-white/92 px-4 text-base font-bold text-slate-900 shadow-lg backdrop-blur active:scale-[.99]"
          >
            <BookOpen size={19} /> Ver carta
          </button>

          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => phone ? (window.location.href = `tel:${phone}`) : undefined}
              className="flex h-11 items-center justify-center gap-1.5 rounded-xl bg-black/55 px-2 text-sm font-bold text-white shadow-lg backdrop-blur border border-white/25 active:scale-[.99]"
            >
              <CalendarDays size={17} /> Reservar mesa
            </button>

            <button
              type="button"
              onClick={() => phone ? (window.location.href = `tel:${phone}`) : undefined}
              className="flex h-11 items-center justify-center gap-1.5 rounded-xl bg-black/55 px-2 text-sm font-bold text-white shadow-lg backdrop-blur border border-white/25 active:scale-[.99]"
            >
              <Phone size={17} /> Llamar
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}
