export interface Configuracion {
  id: string;
  nombre_restaurante: string;
  logotipo_url: string | null;
  imagen_portada_url: string | null;
  color_principal: string;
  color_secundario: string;
  telefono: string | null;
  direccion: string | null;
  moneda: string | null;
  idioma: string | null;
  horario: string | null;
}

export interface Familia {
  id: string;
  nombre: string;
  descripcion: string | null;
  imagen_url: string | null;
  orden: number;
  visible: boolean;
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
  disponible: boolean;
  orden: number;
  alergenos?: Alergeno[];
}

export interface ProductoAlergeno {
  producto_id: string;
  alergeno_id: string;
}