
import { BaseModel } from '../../../_metronic/shared/crud-table';

export interface Bloqueo
{
  Habitacion:string,
  Cuarto:number;
  Desde:string;
  Hasta:string;
  sinLlegadas:boolean;
  sinSalidas:boolean;
  fueraDeServicio:boolean;
  Comentarios:string;
}
