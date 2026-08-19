export interface Configuracion {
  id: string;
  nombre_restaurante: string;
  logotipo_url: string | null;
  portada_url: string | null;
  color_principal: string | null;
  color_secundario: string | null;
  telefono: string | null;
  direccion: string | null;
  moneda: string | null;
  idioma: string | null;
  horario: string | null;
  url_reservas_mesa: string | null;
}

export interface Familia {
  id: string;
  configuracion_restaurante_id: string;
  nombre: string;
  descripcion: string | null;
  foto_url: string | null;
  activo: boolean;
  orden: number;
  created_at: string;
  updated_at: string;
}

export interface Alergeno {
  id: string;
  nombre: string;
  sigla: string | null;
  icono: string | null;
  descripcion: string | null;
  orden: number;
}

export interface Producto {
  id: string;
  configuracion_restaurante_id: string;
  familia_id: string;
  nombre: string;
  descripcion: string | null;
  precio: number;
  foto_url: string | null;
  activo: boolean;
  agotado: boolean;
  destacado: boolean;
  sugerido: boolean;
  orden: number;
  created_at: string;
  updated_at: string;
  alergenos?: Alergeno[];
}

export interface ProductoAlergeno {
  producto_id: string;
  alergeno_id: string;
}
