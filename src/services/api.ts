import { supabase } from '../lib/supabase';
import type { Configuracion, Familia, Producto } from '../types/database';

export const api = {
  async getConfiguracion(): Promise<Configuracion | null> {
    try {
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
    } catch (e) {
      console.error('Network error fetching configuracion:', e);
      return null;
    }
  },

  async getFamilias(): Promise<Familia[]> {
    try {
      const { data, error } = await supabase
        .from('familias')
        .select('*')
        .eq('visible', true)
        .order('orden', { ascending: true });

      if (error) {
        console.error('Error fetching familias:', error);
        return [];
      }
      return data || [];
    } catch (e) {
      console.error('Network error fetching familias:', e);
      return [];
    }
  },

  async getProductosByFamilia(familiaId: string): Promise<Producto[]> {
    try {
      const { data, error } = await supabase
        .from('productos')
        .select(`
          *,
          producto_alergeno (
            alergenos (*)
          )
        `)
        .eq('familia_id', familiaId)
        .eq('disponible', true)
        .order('orden', { ascending: true }); // Using 'orden' as per Phase 2 explicit DB checks, assuming order matters inside categories

      if (error) {
        console.error('Error fetching productos by familia:', error);
        return [];
      }

      return (data || []).map((p: any) => ({
        ...p,
        alergenos: p.producto_alergeno
          ?.map((pa: any) => pa.alergenos)
          .filter((a: any) => a !== null) || [],
      }));
    } catch (e) {
      console.error('Network error fetching productos by familia:', e);
      return [];
    }
  },

  async getProductoById(id: string): Promise<Producto | null> {
    try {
      const { data, error } = await supabase
        .from('productos')
        .select(`
          *,
          producto_alergeno (
            alergenos (*)
          )
        `)
        .eq('id', id)
        .eq('disponible', true)
        .single();

      if (error) {
        console.error('Error fetching producto by id:', error);
        return null;
      }

      if (!data) return null;

      return {
        ...data,
        alergenos: data.producto_alergeno
          ?.map((pa: any) => pa.alergenos)
          .filter((a: any) => a !== null) || [],
      };
    } catch (e) {
      console.error('Network error fetching producto by id:', e);
      return null;
    }
  },

  async buscarProductos(query: string): Promise<Producto[]> {
    if (!query.trim()) return [];

    try {
      const { data, error } = await supabase
        .from('productos')
        .select(`
          *,
          producto_alergeno (
            alergenos (*)
          )
        `)
        .eq('disponible', true)
        .ilike('nombre', `%${query}%`)
        .order('orden', { ascending: true });

      if (error) {
        console.error('Error searching productos:', error);
        return [];
      }

      return (data || []).map((p: any) => ({
        ...p,
        alergenos: p.producto_alergeno
          ?.map((pa: any) => pa.alergenos)
          .filter((a: any) => a !== null) || [],
      }));
    } catch (e) {
      console.error('Network error searching productos:', e);
      return [];
    }
  },

  async getProductosByIds(ids: string[]): Promise<Producto[]> {
    if (!ids.length) return [];

    try {
      const { data, error } = await supabase
        .from('productos')
        .select(`
          *,
          producto_alergeno (
            alergenos (*)
          )
        `)
        .in('id', ids)
        .eq('disponible', true);

      if (error) {
        console.error('Error fetching productos by ids:', error);
        return [];
      }

      return (data || []).map((p: any) => ({
        ...p,
        alergenos: p.producto_alergeno
          ?.map((pa: any) => pa.alergenos)
          .filter((a: any) => a !== null) || [],
      }));
    } catch (e) {
      console.error('Network error fetching productos by ids:', e);
      return [];
    }
  }
};