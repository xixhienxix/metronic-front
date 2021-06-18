
import { BaseModel } from '../../../_metronic/shared/crud-table';

export interface Bloqueo extends BaseModel
{
  Habitacion:string,
  Cuarto:string;
  Desde:string;
  Hasta:string;
  Restricciones:string;
}
