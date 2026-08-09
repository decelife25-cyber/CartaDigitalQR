import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { BookOpen, Phone, CalendarDays } from 'lucide-react';
import { api } from '../services/api';
import type { Configuracion } from '../types/database';

const PORTADA_IMAGE = `${import.meta.env.BASE_URL}portada-carta-digital.jpg`;

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
      <img src={PORTADA_IMAGE} alt="Taberna Camborio" className="absolute inset-0 h-full w-full object-cover" />
      <div className="absolute inset-0 bg-gradient-to-b from-black/10 via-black/10 to-black/70" />
      <div className="absolute inset-x-0 bottom-0 z-10 px-5 pb-[max(1.5rem,env(safe-area-inset-bottom))] pt-20">
        <div className="mx-auto flex w-full max-w-md flex-col gap-2.5">
          <button type="button" onClick={() => navigate('/familias')} className="flex h-14 w-full items-center justify-center gap-2 rounded-2xl bg-white/95 px-5 text-base font-extrabold text-slate-900 shadow-xl backdrop-blur active:scale-[.99]">
            <BookOpen size={20} /> Ver carta
          </button>
          <button type="button" onClick={() => phone ? (window.location.href = `tel:${phone}`) : undefined} className="flex h-14 w-full items-center justify-center gap-2 rounded-2xl bg-[var(--color-primary)] px-5 text-base font-extrabold text-white shadow-xl backdrop-blur active:scale-[.99]">
            <CalendarDays size={20} /> Reservar mesa
          </button>
          <button type="button" onClick={() => phone ? (window.location.href = `tel:${phone}`) : undefined} className="flex h-14 w-full items-center justify-center gap-2 rounded-2xl border border-white/70 bg-black/35 px-5 text-base font-extrabold text-white shadow-xl backdrop-blur active:scale-[.99]">
            <Phone size={20} /> Llamar al restaurante
          </button>
        </div>
      </div>
    </main>
  );
}
