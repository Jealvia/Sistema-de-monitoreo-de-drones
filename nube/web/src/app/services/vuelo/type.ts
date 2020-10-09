import { IRuta } from '../ruta/type';

export interface IDronConexionData {
    id: string;
    modelo: string;
    numero_serie: string;
    tipo_dron: string;
    marca: string;
    capacidad: string;
    descripcion: string;
  }

export class IDronConexion {
  dron?: IDronConexionData;
  estado: boolean;
  fecha_fin: string;
  fecha_inicio: string;
  _id?: string;
  routes?: Array<IRuta>;
  selected?: boolean = false;
  route?: any = null;
}


//Manjedo de datos del vuelo
export interface Id {
  $oid: string;
}

export interface Id2 {
  $oid: string;
}

export interface Dron {
  id: Id2;
  modelo: string;
  numero_serie: string;
  tipo_dron: string;
  marca: string;
  capacidad: number;
  descripcion: string;
}

export interface Id3 {
  $oid: string;
}

export interface PuntosRuta {
  altitud: number;
  latitud: number;
  longitud: number;
}

export interface Ruta {
  id: Id3;
  nombre: string;
  puntos_ruta: PuntosRuta[];
}

export interface Dron2 {
  id: string;
  modelo: string;
  numero_serie: string;
  tipo_dron: string;
  marca: string;
  capacidad: number;
  descripcion: string;
}

export interface UbicacionActual {
  latitud: number;
  altitud: number;
  longitud: number;
}

export interface Rotaciones {
  y: string;
  x: string;
  z: string;
}

export interface Position {
  ubicacion_actual: UbicacionActual;
  rotaciones: Rotaciones;
  voltaje: string;
  dron_id: string;
  velocidad: number[];
  mision_id: string;
  siguiente_waypoint: number;
  corriente: string;
  bateria_residua: string;
}

export interface DatosList {
  dron: Dron2;
  position: Position;
}

export interface Mision {
  _id: Id;
  fecha_inicio: string;
  nombre: string;
  dron: Dron;
  ruta: Ruta;
  datos_list: DatosList[];
  active: boolean;
}

