import { supabase } from '../lib/supabase';
import type { Configuracion, Familia, Producto } from '../types/database';

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
      .eq('activa', true)
      .order('orden', { ascending: true });

    if (error) {
      console.error('Error fetching familias:', error);
      return [];
    }
    return data;
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
      .order('nombre', { ascending: true });

    if (error) {
      console.error('Error fetching productos by familia:', error);
      return [];
    }

    return data.map((p: any) => ({
      ...p,
      alergenos: p.producto_alergeno
        .map((pa: any) => pa.alergenos)
        .filter((a: any) => a !== null),
    }));
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

    return {
      ...data,
      alergenos: data.producto_alergeno
        .map((pa: any) => pa.alergenos)
        .filter((a: any) => a !== null),
    };
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
      .ilike('nombre', `%${query}%`)
      .order('nombre', { ascending: true });

    if (error) {
      console.error('Error searching productos:', error);
      return [];
    }

    return data.map((p: any) => ({
      ...p,
      alergenos: p.producto_alergeno
        .map((pa: any) => pa.alergenos)
        .filter((a: any) => a !== null),
    }));
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

    return data.map((p: any) => ({
      ...p,
      alergenos: p.producto_alergeno
        .map((pa: any) => pa.alergenos)
        .filter((a: any) => a !== null),
    }));
  }
};