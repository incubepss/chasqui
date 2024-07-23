export interface IDireccionChasqui1 {
  latitud: string;
  longitud: string;
  [key: string]: any;
}

export interface IPuntoEntregaChasqui1 {
  habilitado: boolean;
  mensaje: string;
  nombre: string;
  direccion: IDireccionChasqui1;
  [key: string]: any;
}
