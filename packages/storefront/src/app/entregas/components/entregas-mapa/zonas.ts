export interface IZonaChasqui1 {
  geometry: {
    coordinates: Array<{
      x: number;
      y: number;
    }>;
  };
  properties: {
    id: number;
    mensaje: string;
    nombreZona: string;
    [key: string]: any;
  };
  [key: string]: any;
}
