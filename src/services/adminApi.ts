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

/**
 * Comprime una imagen utilizando Canvas.
 */
async function compressImage(file: File): Promise<File> {
  // Limitar tamaños
  const MAX_WIDTH = 1080;
  const MAX_HEIGHT = 1080;
  const QUALITY = 0.8;

  return new Promise((resolve, reject) => {
    // Si no es imagen, o es muy pequeña en bytes (<200KB), devolver tal cual
    if (!file.type.startsWith('image/') || file.size < 200 * 1024) {
      return resolve(file);
    }

    const img = new Image();
    const url = URL.createObjectURL(file);

    img.onload = () => {
      URL.revokeObjectURL(url);

      let width = img.width;
      let height = img.height;

      if (width <= MAX_WIDTH && height <= MAX_HEIGHT) {
         // Ya es pequeña, devolver original (aunque podría re-comprimirse si pesa mucho)
         if (file.size < 500 * 1024) {
            return resolve(file);
         }
      }

      if (width > height) {
        if (width > MAX_WIDTH) {
          height = Math.round(height * (MAX_WIDTH / width));
          width = MAX_WIDTH;
        }
      } else {
        if (height > MAX_HEIGHT) {
          width = Math.round(width * (MAX_HEIGHT / height));
          height = MAX_HEIGHT;
        }
      }

      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;

      const ctx = canvas.getContext('2d');
      if (!ctx) {
        return resolve(file); // fallback
      }

      ctx.drawImage(img, 0, 0, width, height);

      const mimeType = file.type === 'image/png' ? 'image/png' : 'image/jpeg';
      const fileExtension = mimeType === 'image/png' ? 'png' : 'jpg';

      canvas.toBlob(
        (blob) => {
          if (!blob) return resolve(file);
          const compressed = new File([blob], file.name.replace(/\.[^/.]+$/, "") + `.${fileExtension}`, {
            type: mimeType,
            lastModified: Date.now(),
          });
          resolve(compressed);
        },
        mimeType,
        QUALITY
      );
    };

    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('Error al leer la imagen para comprimir'));
    };

    img.src = url;
  });
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

  async uploadProductoFoto(file: File): Promise<string> {
    await requireSession();
    const compressedFile = await compressImage(file);
    const fileExt = compressedFile.name.split('.').pop();
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 15)}.${fileExt}`;
    const filePath = `${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from('productos')
      .upload(filePath, compressedFile, {
        cacheControl: '3600',
        upsert: false,
      });

    if (uploadError) {
      throw new Error(`No se pudo subir la imagen: ${getErrorMessage(uploadError)}`);
    }

    const { data } = supabase.storage.from('productos').getPublicUrl(filePath);
    if (!data.publicUrl) {
      throw new Error('No se pudo obtener la URL pública de la imagen.');
    }
    return data.publicUrl;
  },

  async deleteProductoFoto(fotoUrl: string): Promise<void> {
    await requireSession();
    if (!fotoUrl) return;
    try {
      const url = new URL(fotoUrl);
      const parts = url.pathname.split('/');
      const bucketIndex = parts.indexOf('productos');
      if (bucketIndex !== -1 && bucketIndex < parts.length - 1) {
        const filePath = parts.slice(bucketIndex + 1).join('/');
        const { error } = await supabase.storage.from('productos').remove([filePath]);
        if (error) {
          console.error('Error eliminando la foto de Supabase Storage:', error);
          throw new Error(`No se pudo eliminar la imagen: ${getErrorMessage(error)}`);
        }
      }
    } catch (e) {
      console.error('Error al intentar eliminar fotoUrl:', fotoUrl, e);
      if (e instanceof Error) throw e;
    }
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

    let configuracionRestauranteId = fields.configuracion_restaurante_id ?? null;
    if (!configuracionRestauranteId) {
      const { data: familiaExistente, error: familiaError } = await supabase
        .from('familias')
        .select('configuracion_restaurante_id')
        .not('configuracion_restaurante_id', 'is', null)
        .order('orden', { ascending: true })
        .limit(1)
        .maybeSingle();
      if (familiaError) throw new Error(`No se puede determinar el restaurante de la familia: ${getErrorMessage(familiaError)}`);
      configuracionRestauranteId = familiaExistente?.configuracion_restaurante_id ?? null;
    }

    const { data, error } = await supabase
      .from('familias')
      .insert([{
        nombre: fields.nombre,
        descripcion: fields.descripcion ?? null,
        foto_url: fields.foto_url ?? null,
        activo: fields.activo ?? true,
        orden: fields.orden ?? 0,
        configuracion_restaurante_id: configuracionRestauranteId,
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
