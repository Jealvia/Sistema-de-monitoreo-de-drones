import { DatosList } from 'app/services/vuelo/type';

export interface IPoint {
  initial?: boolean;
  marker: any;
  end?: boolean;
  takeoff: number;
  dron_id?: string;
  data_punto?: DatosList;
}
