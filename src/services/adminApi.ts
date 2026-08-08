import { supabase } from '../lib/supabase';
import type { Familia, Producto, Alergeno } from '../types/database';

export const adminApi = {
  // --- Productos ---
  async getProductosAdmin(): Promise<Producto[]> {
    const { data, error } = await supabase
      .from('productos')
      .select(`
        *,
        producto_alergeno (
          alergenos (*)
        )
      `)
      .order('nombre', { ascending: true });

    if (error) {
      console.error('Error fetching productos (admin):', error);
      throw error;
    }

    return (data || []).map((p: any) => ({
      ...p,
      alergenos: (p.producto_alergeno || [])
        .map((pa: any) => pa.alergenos)
        .filter(Boolean),
    }));
  },

  async getProductoByIdAdmin(id: string): Promise<Producto | null> {
    const { data, error } = await supabase
      .from('productos')
      .select(`
        *,
        producto_alergeno (
          alergenos (*)
        )
      `)
      .eq('id', id)
      .single();

    if (error) {
      console.error('Error fetching producto by id (admin):', error);
      throw error;
    }

    if (!data) return null;

    const { data: psData, error: psError } = await supabase
      .from('producto_sugerencias')
      .select(`
        productos!sugerencia_id (*)
      `)
      .eq('producto_id', id);

    if (psError) {
      console.error('Error fetching sugerencias (admin):', psError);
      throw psError;
    }

    return {
      ...data,
      alergenos: ((data as any).producto_alergeno || [])
        .map((pa: any) => pa.alergenos)
        .filter(Boolean),
      sugerencias: (psData || [])
        .map((ps: any) => ps.productos)
        .filter(Boolean),
    };
  },

  async createProducto(
    producto: Partial<Producto>,
    alergenosIds: string[],
    sugerenciasIds: string[],
  ): Promise<Producto | null> {
    // The current public application and database types use these fields directly.
    // Do not translate to the old imagen/estado/disponibilidad schema here.
    const { data, error } = await supabase
      .from('productos')
      .insert([
        {
          nombre: producto.nombre,
          descripcion: producto.descripcion,
          precio: producto.precio,
          familia_id: producto.familia_id,
          foto_url: producto.foto_url,
          activo: producto.activo,
          agotado: producto.agotado,
        },
      ])
      .select()
      .single();

    if (error) {
      console.error('Error creating producto:', error);
      throw error;
    }

    if (!data) return null;

    await this.replaceAlergenos(data.id, alergenosIds);
    await this.replaceSugerencias(data.id, sugerenciasIds);

    return data as Producto;
  },

  async updateProducto(
    id: string,
    producto: Partial<Producto>,
    alergenosIds: string[],
    sugerenciasIds: string[],
  ): Promise<void> {
    const { error } = await supabase
      .from('productos')
      .update({
        nombre: producto.nombre,
        descripcion: producto.descripcion,
        precio: producto.precio,
        familia_id: producto.familia_id,
        foto_url: producto.foto_url,
        activo: producto.activo,
        agotado: producto.agotado,
      })
      .eq('id', id);

    if (error) {
      console.error('Error updating producto:', error);
      throw error;
    }

    await this.replaceAlergenos(id, alergenosIds);
    await this.replaceSugerencias(id, sugerenciasIds);
  },

  async replaceAlergenos(id: string, alergenosIds: string[]): Promise<void> {
    const { error: deleteError } = await supabase
      .from('producto_alergeno')
      .delete()
      .eq('producto_id', id);

    if (deleteError) {
      console.error('Error deleting existing alergenos:', deleteError);
      throw deleteError;
    }

    if (alergenosIds.length === 0) return;

    const { error: insertError } = await supabase
      .from('producto_alergeno')
      .insert(alergenosIds.map((alergeno_id) => ({
        producto_id: id,
        alergeno_id,
      })));

    if (insertError) {
      console.error('Error inserting alergenos:', insertError);
      throw insertError;
    }
  },

  async replaceSugerencias(id: string, sugerenciasIds: string[]): Promise<void> {
    const { error: deleteError } = await supabase
      .from('producto_sugerencias')
      .delete()
      .eq('producto_id', id);

    if (deleteError) {
      console.error('Error deleting existing sugerencias:', deleteError);
      throw deleteError;
    }

    if (sugerenciasIds.length === 0) return;

    const { error: insertError } = await supabase
      .from('producto_sugerencias')
      .insert(sugerenciasIds.map((sugerencia_id) => ({
        producto_id: id,
        sugerencia_id,
      })));

    if (insertError) {
      console.error('Error inserting sugerencias:', insertError);
      throw insertError;
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
