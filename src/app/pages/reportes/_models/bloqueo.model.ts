
import { BaseModel } from '../../../_metronic/shared/crud-table';

export interface Bloqueo
{
  Habitacion:Array<string>,
  Cuarto:Array<number>;
  Desde:string;
  Hasta:string;
  sinLlegadas:boolean;
  sinSalidas:boolean;
  fueraDeServicio:boolean;
  Comentarios:string;
}
