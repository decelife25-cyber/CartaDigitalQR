-- Archivo de documentación y configuración para Supabase Storage
-- Tarea: Subida de fotografías de productos.

-- 1. Crear el bucket 'productos' si no existe
INSERT INTO storage.buckets (id, name, public)
VALUES ('productos', 'productos', true)
ON CONFLICT (id) DO NOTHING;

-- 2. Políticas de Seguridad (RLS) para el bucket 'productos'

-- Permitir lectura pública de los archivos en el bucket 'productos'
CREATE POLICY "Permitir lectura publica" ON storage.objects
FOR SELECT
USING (bucket_id = 'productos');

-- Permitir a los usuarios autenticados subir (INSERT) archivos al bucket 'productos'
CREATE POLICY "Permitir subida autenticada" ON storage.objects
FOR INSERT
WITH CHECK (
  bucket_id = 'productos' AND
  auth.role() = 'authenticated'
);

-- Permitir a los usuarios autenticados actualizar (UPDATE) archivos en el bucket 'productos'
CREATE POLICY "Permitir actualizacion autenticada" ON storage.objects
FOR UPDATE
USING (
  bucket_id = 'productos' AND
  auth.role() = 'authenticated'
);

-- Permitir a los usuarios autenticados eliminar (DELETE) archivos en el bucket 'productos'
CREATE POLICY "Permitir eliminacion autenticada" ON storage.objects
FOR DELETE
USING (
  bucket_id = 'productos' AND
  auth.role() = 'authenticated'
);
