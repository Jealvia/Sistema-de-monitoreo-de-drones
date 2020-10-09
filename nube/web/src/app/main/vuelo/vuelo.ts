export interface Dron {
  capacidad: number;
  descripcion: string;
  id: string;
  marca: string;
  modelo: string;
  numero_serie: string;
  tipo_dron: string;
}

export interface MisionData {
  _id: string;
  dron: Dron;
  fecha_inicio: string;
  nombre: string;
  hora_inicio: string;
  hora_fin: string;
}
