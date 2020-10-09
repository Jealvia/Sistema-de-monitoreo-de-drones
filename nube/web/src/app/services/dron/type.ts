import { IRuta } from "../ruta/type";

export interface IDron {
  _id: string;
  modelo: string;
  numero_serie: string;
  tipo_dron: string;
  marca: string;
  capacidad: string;
  descripcion: string;
}

export interface IPATCHDron {
  modelo: string;
  numero_serie: string;
  tipo_dron: string;
  marca: string;
  capacidad: string;
  descripcion: string;
}

export class IDronMision {
  _id: string;
  modelo: string;
  numero_serie: string;
  tipo_dron: string;
  marca: string;
  capacidad: string;
  descripcion: string;
  selected?: boolean = false;
  route?: any = null;
  routes: Array<IRuta> = [];
}
