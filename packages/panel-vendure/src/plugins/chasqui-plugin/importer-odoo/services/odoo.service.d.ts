export type PaginatedResponse<T> = {
  total: number;
  limit: number;
  skip: number;
  data: T[];
};

export type Tienda = {
  id: number;
  nombre_corto_vendedor: string;
  nombre_vendedor: string;
  visible_en_multicatalogo: boolean;
  ventas_habilitadas: boolean;
  monto_minimo_pedido: number;
  [key: string]: any;
};

export type TiendasResponse = PaginatedResponse<Tienda>;

export type Imagen = {
  id: number;
  name: string;
  base64String: string;
};

export type Categoria = {
  id: number;
  id_vendedor: number;
  nombre: string;
};

export type Caracteristica = {
  id: number;
  nombre: string;
};

export type Variante = {
  id: number;
  codigo: string;
  IMAGENs: Array<Imagen>;
  destacado: boolean;
  descripcion: string;
  precio: number;
  incentivo: number;
  stock: number;
};

export type ProductorOdoo = {
  id: number;
  nombre: string;
  CARACTERISTICA_PRODUCTOR: Caracteristica;
  altura: string;
  calle: string;
  descripcion_corta: string;
  descripcion_larga: string;
  id: number;
  imagen: string;
  localidad: string;
  nombre: string;
  pais: string;
  provincia: string;
};

export type Producto = {
  id: number;
  nombre: string;
  ocultado: boolean;
  VARIANTEs: Array<Variante>;
  PRODUCTOR: ProductorOdoo;
  CATEGORIum: Categoria;
  CARACTERISTICAs: Array<Caracteristica>;
};

export type ZonaChaqui1 = {
  type: string;
  status: string;
  geometry: {
    coordinates: Array<{ x: number; y: number }>;
  };
  properties: {
    mensaje: string;
    nombreZona: string;
  };
};

export type PuntoEntregaChaqui1 = {
  habilitado: boolean;
  nombre: string;
  mensaje: string;
  direccion: {
    calle: string;
    altura: string;
    provincia: string;
    localidad: string;
    geoUbicacion: {
      coordinates: Array<number>;
    };
  };
};

export type OdooProduct = {
  id: number;
  name: string;
  list_price: number;
  qty_available: number;
  image_128: string;
  product_tooltip: string;
  barcode: string;
  taxes_id: [number];
  tax_string: string;
  pos_categ: string;
  sellos?: [];
};
