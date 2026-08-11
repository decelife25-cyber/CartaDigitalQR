import { supabase } from '../lib/supabase';
import type { Familia, Producto, Alergeno } from '../types/database';

function mapProducto(producto: any): Producto {
  return {
    ...producto,
    alergenos: (producto.producto_alergeno ?? producto.producto_alergenos ?? [])
      .map((pa: any) => pa.alergenos)
      .filter(Boolean),
  };
}

function getErrorMessage(error: unknown): string {
  if (error && typeof error === 'object' && 'message' in error) {
    return String((error as { message: unknown }).message);
  }
  return String(error);
}

async function requireSession(): Promise<void> {
  const { data, error } = await supabase.auth.getSession();
  if (error) throw error;
  if (!data.session) {
    throw new Error('Sesión no válida. Vuelve a iniciar sesión.');
  }
}

export const adminApi = {
  async getProductosAdmin(): Promise<Producto[]> {
    await requireSession();
    const { data, error } = await supabase
      .from('productos')
      .select(`*, producto_alergeno ( alergenos (*) )`)
      .order('orden', { ascending: true });
    if (error) throw new Error(`No se pueden cargar los productos: ${getErrorMessage(error)}`);
    return (data ?? []).map(mapProducto);
  },

  async getProductoByIdAdmin(id: string): Promise<Producto | null> {
    await requireSession();
    const { data, error } = await supabase
      .from('productos')
      .select(`*, producto_alergeno ( alergenos (*) )`)
      .eq('id', id)
      .single();
    if (error) throw new Error(`No se puede cargar el producto: ${getErrorMessage(error)}`);
    return data ? mapProducto(data) : null;
  },

  async createProducto(producto: Partial<Producto>, alergenosIds: string[]): Promise<Producto | null> {
    await requireSession();
    if (!producto.familia_id) throw new Error('El producto necesita una familia.');

    const { data: familia, error: familiaError } = await supabase
      .from('familias')
      .select('configuracion_restaurante_id')
      .eq('id', producto.familia_id)
      .single();
    if (familiaError) throw new Error(`No se puede determinar el restaurante de la familia: ${getErrorMessage(familiaError)}`);
    if (!familia?.configuracion_restaurante_id) throw new Error('La familia seleccionada no tiene restaurante asociado.');

    const { data, error } = await supabase
      .from('productos')
      .insert([{
        configuracion_restaurante_id: familia.configuracion_restaurante_id,
        nombre: producto.nombre,
        descripcion: producto.descripcion,
        precio: producto.precio,
        familia_id: producto.familia_id,
        foto_url: producto.foto_url,
        activo: producto.activo ?? true,
        agotado: producto.agotado ?? false,
        destacado: producto.destacado ?? false,
        sugerido: producto.sugerido ?? false,
        orden: producto.orden ?? 0,
      }])
      .select()
      .single();
    if (error) throw new Error(`No se puede crear el producto: ${getErrorMessage(error)}`);
    if (!data) return null;

    try {
      await this.replaceAlergenos(data.id, alergenosIds);
    } catch (error) {
      await supabase.from('productos').delete().eq('id', data.id);
      throw error;
    }
    return mapProducto(data);
  },

  async updateProducto(id: string, producto: Partial<Producto>, alergenosIds: string[]): Promise<void> {
    await requireSession();
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
        destacado: producto.destacado,
        sugerido: producto.sugerido,
        orden: producto.orden ?? 0,
      })
      .eq('id', id);
    if (error) throw new Error(`No se puede actualizar el producto: ${getErrorMessage(error)}`);
    await this.replaceAlergenos(id, alergenosIds);
  },

  async updateProductoFields(id: string, fields: Partial<Pick<Producto, 'activo' | 'agotado' | 'destacado' | 'sugerido' | 'orden'>>): Promise<void> {
    await requireSession();
    const { error } = await supabase.from('productos').update(fields).eq('id', id);
    if (error) throw new Error(`No se puede actualizar el producto: ${getErrorMessage(error)}`);
  },

  async replaceAlergenos(id: string, alergenosIds: string[]): Promise<void> {
    await requireSession();
    const { error: deleteError } = await supabase.from('producto_alergeno').delete().eq('producto_id', id);
    if (deleteError) throw new Error(`No se pueden actualizar los alérgenos: ${getErrorMessage(deleteError)}`);
    if (!alergenosIds.length) return;
    const { error: insertError } = await supabase
      .from('producto_alergeno')
      .insert(alergenosIds.map((alergeno_id) => ({ producto_id: id, alergeno_id })));
    if (insertError) throw new Error(`No se pueden guardar los alérgenos: ${getErrorMessage(insertError)}`);
  },

  async deleteProducto(id: string): Promise<void> {
    await requireSession();
    const { error } = await supabase.from('productos').delete().eq('id', id);
    if (error) throw new Error(`No se puede eliminar el producto: ${getErrorMessage(error)}`);
  },

  async getAlergenosAdmin(): Promise<Alergeno[]> {
    await requireSession();
    const { data, error } = await supabase.from('alergenos').select('*').order('orden', { ascending: true });
    if (error) throw new Error(`No se pueden cargar los alérgenos: ${getErrorMessage(error)}`);
    return data ?? [];
  },

  async getFamiliasAdmin(): Promise<Familia[]> {
    await requireSession();
    const { data, error } = await supabase.from('familias').select('*').order('orden', { ascending: true });
    if (error) throw new Error(`No se pueden cargar las familias: ${getErrorMessage(error)}`);
    return data ?? [];
  },

  async updateFamilia(id: string, fields: Partial<Familia>): Promise<void> {
    await requireSession();
    const { error } = await supabase.from('familias').update(fields).eq('id', id);
    if (error) throw new Error(`No se puede actualizar la familia: ${getErrorMessage(error)}`);
  },

  async createFamilia(fields: Partial<Familia>): Promise<Familia | null> {
    await requireSession();
    const { data, error } = await supabase
      .from('familias')
      .insert([{
        nombre: fields.nombre,
        activo: fields.activo ?? true,
        orden: fields.orden ?? 0,
        configuracion_restaurante_id: fields.configuracion_restaurante_id ?? null,
      }])
      .select()
      .single();
    if (error) throw new Error(`No se puede crear la familia: ${getErrorMessage(error)}`);
    return data;
  },

  async deleteFamilia(id: string): Promise<void> {
    await requireSession();
    const { error } = await supabase.from('familias').delete().eq('id', id);
    if (error) throw new Error(`No se puede eliminar la familia: ${getErrorMessage(error)}`);
  },
};
