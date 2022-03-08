import { BaseModel } from '../../../_metronic/shared/crud-table';

export interface Habitaciones extends BaseModel
{
  Codigo:string,
  Numero:string,
  Descripcion:string,
  Estatus:number;
  Camas:number;
  Personas:number;
  Personas_Extra:number;
  Tarifa:number;
}
