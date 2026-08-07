export interface Configuracion {
  id: string;
  nombre_restaurante: string;
  logo_url: string | null;
  imagen_portada_url: string | null;
  color_primario: string;
  color_secundario: string;
}

export interface Familia {
  id: string;
  nombre: string;
  descripcion: string | null;
  imagen_url: string | null;
  orden: number;
  activa: boolean;
}

export interface Alergeno {
  id: string;
  nombre: string;
  icono_url: string | null;
}

export interface Producto {
  id: string;
  familia_id: string;
  nombre: string;
  descripcion: string | null;
  precio: number;
  imagen_url: string | null;
  destacado: boolean;
  activo: boolean;
  alergenos?: Alergeno[];
}

export interface ProductoAlergeno {
  producto_id: string;
  alergeno_id: string;
}