import { supabase } from '../lib/supabase';
import type { Familia, Producto, Alergeno } from '../types/database';

function mapProducto(producto: any): Producto {
  return {
    ...producto,
    alergenos: (producto.producto_alergeno ?? [])
      .map((pa: any) => pa.alergenos)
      .filter(Boolean),
  };
}

export const adminApi = {
  async getProductosAdmin(): Promise<Producto[]> {
    const { data, error } = await supabase
      .from('productos')
      .select(`*, producto_alergeno ( alergenos (*) )`)
      .order('orden', { ascending: true });

    if (error) throw error;
    return (data ?? []).map(mapProducto);
  },

  async getProductoByIdAdmin(id: string): Promise<Producto | null> {
    const { data, error } = await supabase
      .from('productos')
      .select(`*, producto_alergeno ( alergenos (*) )`)
      .eq('id', id)
      .single();

    if (error) throw error;
    return data ? mapProducto(data) : null;
  },

  async createProducto(producto: Partial<Producto>, alergenosIds: string[]): Promise<Producto | null> {
    const { data, error } = await supabase
      .from('productos')
      .insert([{
        nombre: producto.nombre,
        descripcion: producto.descripcion,
        precio: producto.precio,
        familia_id: producto.familia_id,
        imagen_url: producto.imagen_url,
        disponible: producto.disponible,
        destacado: producto.destacado,
        orden: producto.orden ?? 0,
      }])
      .select()
      .single();

    if (error) throw error;
    if (!data) return null;

    await this.replaceAlergenos(data.id, alergenosIds);
    return data as Producto;
  },

  async updateProducto(id: string, producto: Partial<Producto>, alergenosIds: string[]): Promise<void> {
    const { error } = await supabase
      .from('productos')
      .update({
        nombre: producto.nombre,
        descripcion: producto.descripcion,
        precio: producto.precio,
        familia_id: producto.familia_id,
        imagen_url: producto.imagen_url,
        disponible: producto.disponible,
        destacado: producto.destacado,
        orden: producto.orden ?? 0,
      })
      .eq('id', id);

    if (error) throw error;
    await this.replaceAlergenos(id, alergenosIds);
  },

  async replaceAlergenos(id: string, alergenosIds: string[]): Promise<void> {
    const { error: deleteError } = await supabase
      .from('producto_alergeno')
      .delete()
      .eq('producto_id', id);
    if (deleteError) throw deleteError;

    if (!alergenosIds.length) return;

    const { error: insertError } = await supabase
      .from('producto_alergeno')
      .insert(alergenosIds.map((alergeno_id) => ({ producto_id: id, alergeno_id })));
    if (insertError) throw insertError;
  },

  async deleteProducto(id: string): Promise<void> {
    const { error } = await supabase.from('productos').delete().eq('id', id);
    if (error) throw error;
  },

  async getAlergenosAdmin(): Promise<Alergeno[]> {
    const { data, error } = await supabase
      .from('alergenos')
      .select('*')
      .order('nombre', { ascending: true });
    if (error) throw error;
    return data ?? [];
  },

  async getFamiliasAdmin(): Promise<Familia[]> {
    const { data, error } = await supabase
      .from('familias')
      .select('*')
      .order('orden', { ascending: true });
    if (error) throw error;
    return data ?? [];
  },
};
