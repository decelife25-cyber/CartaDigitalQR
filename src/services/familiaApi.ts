import { supabase } from '../lib/supabase';

async function requireSession(): Promise<void> {
  const { data, error } = await supabase.auth.getSession();
  if (error) throw error;
  if (!data.session) throw new Error('Sesión no válida. Vuelve a iniciar sesión.');
}

async function compressImage(file: File): Promise<File> {
  const MAX_WIDTH = 1080;
  const MAX_HEIGHT = 1080;
  const QUALITY = 0.8;

  if (!file.type.startsWith('image/') || file.size < 200 * 1024) return file;

  return new Promise((resolve, reject) => {
    const img = new Image();
    const objectUrl = URL.createObjectURL(file);

    img.onload = () => {
      URL.revokeObjectURL(objectUrl);
      let width = img.width;
      let height = img.height;

      if (width <= MAX_WIDTH && height <= MAX_HEIGHT && file.size < 500 * 1024) {
        resolve(file);
        return;
      }

      if (width > height && width > MAX_WIDTH) {
        height = Math.round(height * (MAX_WIDTH / width));
        width = MAX_WIDTH;
      } else if (height >= width && height > MAX_HEIGHT) {
        width = Math.round(width * (MAX_HEIGHT / height));
        height = MAX_HEIGHT;
      }

      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        resolve(file);
        return;
      }
      ctx.drawImage(img, 0, 0, width, height);

      const mimeType = file.type === 'image/png' ? 'image/png' : 'image/jpeg';
      const extension = mimeType === 'image/png' ? 'png' : 'jpg';
      canvas.toBlob((blob) => {
        if (!blob) {
          resolve(file);
          return;
        }
        resolve(new File([blob], `${file.name.replace(/\.[^/.]+$/, '')}.${extension}`, {
          type: mimeType,
          lastModified: Date.now(),
        }));
      }, mimeType, QUALITY);
    };

    img.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      reject(new Error('Error al leer la imagen para comprimir'));
    };
    img.src = objectUrl;
  });
}

export const familiaApi = {
  async uploadFoto(file: File): Promise<string> {
    await requireSession();
    const compressed = await compressImage(file);
    const extension = compressed.name.split('.').pop() || 'jpg';
    const filePath = `familias/${Date.now()}-${Math.random().toString(36).slice(2, 15)}.${extension}`;

    const { error } = await supabase.storage.from('productos').upload(filePath, compressed, {
      cacheControl: '3600',
      upsert: false,
    });
    if (error) throw new Error(`No se pudo subir la imagen: ${error.message}`);

    const { data } = supabase.storage.from('productos').getPublicUrl(filePath);
    if (!data.publicUrl) throw new Error('No se pudo obtener la URL pública de la imagen.');
    return data.publicUrl;
  },

  async deleteFoto(fotoUrl: string): Promise<void> {
    await requireSession();
    if (!fotoUrl) return;
    const url = new URL(fotoUrl);
    const marker = '/storage/v1/object/public/productos/';
    const index = url.pathname.indexOf(marker);
    if (index === -1) return;
    const filePath = decodeURIComponent(url.pathname.slice(index + marker.length));
    if (!filePath.startsWith('familias/')) return;

    const { error } = await supabase.storage.from('productos').remove([filePath]);
    if (error) throw new Error(`No se pudo eliminar la imagen: ${error.message}`);
  },
};
