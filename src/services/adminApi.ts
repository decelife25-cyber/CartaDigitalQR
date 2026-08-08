import { supabase } from '../lib/supabase';
import type { Familia, Producto, Alergeno } from '../types/database';

export const adminApi = {
  // --- Productos ---
  async getProductosAdmin(): Promise<Producto[]> {
    const { data, error } = await supabase
      .from('productos')
      .select(`
        *,
        producto_alergenos (
          alergenos (*)
        )
      `)
      .order('nombre', { ascending: true });

    if (error) {
      console.error('Error fetching productos (admin):', error);
      throw error;
    }

    return (data || []).map(p => {
       const mapped = { ...p };

       mapped.alergenos = (p.producto_alergenos || [])
         .map((pa: any) => pa.alergenos)
         .filter(Boolean);

       return mapped;
    });
  },

  async getProductoByIdAdmin(id: string): Promise<Producto | null> {
    const { data, error } = await supabase
      .from('productos')
      .select(`
        *
      `)
      .eq('id', id)
      .single();

    if (error) {
      console.error('Error fetching producto by id (admin):', error);
      throw error;
    }

    if (!data) return null;

    // Fetch Alergenos
    const { data: paData } = await supabase
      .from('producto_alergenos')
      .select(`
        alergenos (*)
      `)
      .eq('producto_id', id);

    // Fetch Sugerencias
    const { data: psData } = await supabase
      .from('producto_sugerencias')
      .select(`
        productos!sugerencia_id (*)
      `)
      .eq('producto_id', id);

    return {
      ...data,
      alergenos: (paData || []).map((pa: any) => pa.alergenos).filter(Boolean),
      sugerencias: (psData || []).map((ps: any) => ps.productos).filter(Boolean)
    };
  },

  async createProducto(producto: Partial<Producto>, alergenosIds: string[], sugerenciasIds: string[]): Promise<Producto | null> {
    const { data, error } = await supabase
      .from('productos')
      .insert([
        {
          nombre: producto.nombre,
          descripcion: producto.descripcion,
          precio: producto.precio,
          familia_id: producto.familia_id,
          imagen: producto.foto_url,
          estado: producto.activo ? 'Visible' : 'Oculto',
          disponibilidad: !producto.agotado,
        }
      ])
      .select()
      .single();

    if (error) {
      console.error('Error creating producto:', error);
      throw error;
    }

    if (data && alergenosIds.length > 0) {
      const paInserts = alergenosIds.map(aId => ({ producto_id: data.id, alergeno_id: aId }));
      await supabase.from('producto_alergenos').insert(paInserts);
    }

    if (data && sugerenciasIds.length > 0) {
      const psInserts = sugerenciasIds.map(sId => ({ producto_id: data.id, sugerencia_id: sId }));
      await supabase.from('producto_sugerencias').insert(psInserts);
    }

    return data;
  },

  async updateProducto(id: string, producto: Partial<Producto>, alergenosIds: string[], sugerenciasIds: string[]): Promise<void> {
    const { error } = await supabase
      .from('productos')
      .update({
        nombre: producto.nombre,
        descripcion: producto.descripcion,
        precio: producto.precio,
        familia_id: producto.familia_id,
        imagen: producto.foto_url,
        estado: producto.activo ? 'Visible' : 'Oculto',
        disponibilidad: !producto.agotado,
      })
      .eq('id', id);

    if (error) {
      console.error('Error updating producto:', error);
      throw error;
    }

    // Update Alergenos: Delete existing, then insert new
    await supabase.from('producto_alergenos').delete().eq('producto_id', id);
    if (alergenosIds.length > 0) {
      const paInserts = alergenosIds.map(aId => ({ producto_id: id, alergeno_id: aId }));
      await supabase.from('producto_alergenos').insert(paInserts);
    }

    // Update Sugerencias: Delete existing, then insert new
    await supabase.from('producto_sugerencias').delete().eq('producto_id', id);
    if (sugerenciasIds.length > 0) {
      const psInserts = sugerenciasIds.map(sId => ({ producto_id: id, sugerencia_id: sId }));
      await supabase.from('producto_sugerencias').insert(psInserts);
    }
  },

  async deleteProducto(id: string): Promise<void> {
    const { error } = await supabase
      .from('productos')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting producto:', error);
      throw error;
    }
  },

  // --- Alérgenos ---
  async getAlergenosAdmin(): Promise<Alergeno[]> {
    const { data, error } = await supabase
      .from('alergenos')
      .select('*')
      .order('nombre', { ascending: true });

    if (error) {
      console.error('Error fetching alergenos (admin):', error);
      throw error;
    }
    return data || [];
  },

  // --- Familias ---
  async getFamiliasAdmin(): Promise<Familia[]> {
    const { data, error } = await supabase
      .from('familias')
      .select('*')
      .order('orden', { ascending: true });

    if (error) {
      console.error('Error fetching familias (admin):', error);
      throw error;
    }
    return data || [];
  },
};
