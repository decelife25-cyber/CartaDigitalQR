import { supabase } from '../lib/supabase';
import type { Alergeno, Configuracion, Familia, Producto } from '../types/database';

function normalize(value: string): string {
  return value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
}

function localAlergenoIconPath(nombre: string): string | null {
  const key = normalize(nombre);
  const base = `${import.meta.env.BASE_URL}icons/alergenos/erudus`;

  if (key.includes('gluten') || key.includes('cereal')) return `${base}/cereal.svg`;
  if (key.includes('crustace')) return `${base}/crustaceans.svg`;
  if (key.includes('huevo')) return `${base}/eggs.svg`;
  if (key.includes('pescado')) return `${base}/fish.svg`;
  if (key.includes('cacahuet')) return `${base}/peanuts.svg`;
  if (key.includes('soja')) return `${base}/soya.svg`;
  if (key.includes('leche') || key.includes('lact')) return `${base}/milk.svg`;
  if (key.includes('fruto') && key.includes('cascara')) return `${base}/nuts.svg`;
  if (key.includes('apio')) return `${base}/celery.svg`;
  if (key.includes('mostaza')) return `${base}/mustard.svg`;
  if (key.includes('sesamo')) return `${base}/sesame.svg`;
  if (key.includes('sulf') || key.includes('dioxido') || key.includes('azufre')) return `${base}/so2.svg`;
  if (key.includes('altram')) return `${base}/lupin.svg`;
  if (key.includes('molusc')) return `${base}/molluscs.svg`;
  return null;
}

function mapAlergeno(alergeno: Alergeno): Alergeno {
  return {
    ...alergeno,
    icono: localAlergenoIconPath(alergeno.nombre) ?? alergeno.icono ?? null,
  };
}

function mapProducto(producto: any): Producto {
  return {
    ...producto,
    alergenos: (producto.producto_alergeno ?? [])
      .map((pa: any) => pa.alergenos)
      .filter(Boolean)
      .map(mapAlergeno),
  };
}

export const api = {
  async getConfiguracion(): Promise<Configuracion | null> {
    const { data, error } = await supabase
      .from('configuracion_restaurante')
      .select('*')
      .eq('activo', true)
      .limit(1)
      .maybeSingle();

    if (error) {
      console.error('Error fetching configuracion_restaurante:', error);
      return null;
    }

    if (!data) return null;

    return {
      id: data.id,
      nombre_restaurante: data.nombre ?? '',
      logotipo_url: data.logo_url ?? null,
      color_principal: data.color_principal ?? null,
      color_secundario: null,
      telefono: data.telefono ?? null,
      direccion: data.direccion ?? null,
      moneda: '€',
      idioma: 'es',
      horario: data.horario ?? null,
      url_reservas_mesa: data.url_reservas_mesa ?? null,
    };
  },

  async getFamilias(): Promise<Familia[]> {
    const { data, error } = await supabase
      .from('familias')
      .select('*')
      .eq('activo', true)
      .order('orden', { ascending: true });

    if (error) {
      console.error('Error fetching familias:', error);
      return [];
    }
    return data ?? [];
  },

  async getProductosByFamilia(familiaId: string): Promise<Producto[]> {
    const { data, error } = await supabase
      .from('productos')
      .select(`
        *,
        producto_alergeno (
          alergenos (*)
        )
      `)
      .eq('familia_id', familiaId)
      .eq('activo', true)
      .order('orden', { ascending: true });

    if (error) {
      console.error('Error fetching productos by familia:', error);
      return [];
    }

    return (data ?? []).map(mapProducto);
  },

  async getProductoById(id: string): Promise<Producto | null> {
    const { data, error } = await supabase
      .from('productos')
      .select(`
        *,
        producto_alergeno (
          alergenos (*)
        )
      `)
      .eq('id', id)
      .eq('activo', true)
      .single();

    if (error) {
      console.error('Error fetching producto by id:', error);
      return null;
    }

    return data ? mapProducto(data) : null;
  },

  async getSugerencias(): Promise<Producto[]> {
    const { data, error } = await supabase
      .from('productos')
      .select(`
        *,
        producto_alergeno (
          alergenos (*)
        )
      `)
      .eq('activo', true)
      .eq('sugerido', true)
      .order('orden', { ascending: true });

    if (error) {
      console.error('Error fetching sugerencias:', error);
      return [];
    }

    return (data ?? []).map(mapProducto);
  },

  async buscarProductos(query: string): Promise<Producto[]> {
    const term = normalize(query.trim());
    if (!term) return [];

    const { data, error } = await supabase
      .from('productos')
      .select(`
        *,
        producto_alergeno (
          alergenos (*)
        )
      `)
      .eq('activo', true)
      .order('orden', { ascending: true });

    if (error) {
      console.error('Error searching productos:', error);
      return [];
    }

    return (data ?? [])
      .filter((producto: any) => {
        const name = normalize(producto.nombre ?? '');
        const description = normalize(producto.descripcion ?? '');
        return name.includes(term) || description.includes(term);
      })
      .map(mapProducto);
  },

  async getProductosByIds(ids: string[]): Promise<Producto[]> {
    if (!ids.length) return [];

    const { data, error } = await supabase
      .from('productos')
      .select(`
        *,
        producto_alergeno (
          alergenos (*)
        )
      `)
      .in('id', ids)
      .eq('activo', true);

    if (error) {
      console.error('Error fetching productos by ids:', error);
      return [];
    }

    return (data ?? []).map(mapProducto);
  }
};
