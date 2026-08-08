import { supabase } from '../lib/supabase';
import type { Configuracion, Familia, Producto } from '../types/database';

function mapProducto(producto: any): Producto {
  return {
    ...producto,
    alergenos: (producto.producto_alergeno ?? [])
      .map((pa: any) => pa.alergenos)
      .filter(Boolean),
  };
}

export const api = {
  async getConfiguracion(): Promise<Configuracion | null> {
    const { data, error } = await supabase
      .from('configuracion')
      .select('*')
      .limit(1)
      .single();

    if (error && error.code !== 'PGRST116') {
      console.error('Error fetching configuracion:', error);
      return null;
    }
    return data;
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
      .eq('agotado', false)
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
      .eq('agotado', false)
      .single();

    if (error) {
      console.error('Error fetching producto by id:', error);
      return null;
    }

    return data ? mapProducto(data) : null;
  },

  async buscarProductos(query: string): Promise<Producto[]> {
    if (!query.trim()) return [];

    const { data, error } = await supabase
      .from('productos')
      .select(`
        *,
        producto_alergeno (
          alergenos (*)
        )
      `)
      .eq('activo', true)
      .eq('agotado', false)
      .ilike('nombre', `%${query}%`)
      .order('orden', { ascending: true });

    if (error) {
      console.error('Error searching productos:', error);
      return [];
    }

    return (data ?? []).map(mapProducto);
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
      .eq('activo', true)
      .eq('agotado', false);

    if (error) {
      console.error('Error fetching productos by ids:', error);
      return [];
    }

    return (data ?? []).map(mapProducto);
  }
};
