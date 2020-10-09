export interface IPuntos {
  posicion?: number;
  latitud: number;
  longitud: number;
  altitud: number;
  inicio?: boolean;
  fin?: boolean;
}

export interface IRuta {
  _id?: string;
  nombre: string;
  alias: string;
  puntos_ruta: Array<IPuntos>;
}
