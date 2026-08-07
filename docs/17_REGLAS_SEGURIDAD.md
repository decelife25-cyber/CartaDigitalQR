# 17 - REGLAS DE SEGURIDAD (RLS)

## Objetivo
Definir las políticas de seguridad (Row Level Security) en Supabase.

## Políticas Generales
- Las tablas (`familias`, `productos`, `alergenos`, `configuracion`) deben tener RLS habilitado.

## Reglas
- **Lectura Pública**: `CREATE POLICY "Permitir lectura publica" ON public.productos FOR SELECT USING (true);` (Y aplicable al resto de tablas).
- **Escritura Privada**: `CREATE POLICY "Permitir escritura autenticada" ON public.productos FOR ALL USING (auth.role() = 'authenticated');` (Y aplicable al resto de tablas).
- No se permiten `INSERT`, `UPDATE` ni `DELETE` por parte de roles anónimos bajo ninguna circunstancia.
