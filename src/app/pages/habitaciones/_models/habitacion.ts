import { BaseModel } from '../../../_metronic/shared/crud-table';

export interface Habitacion extends BaseModel
{
  Codigo:string,
  Numero:number,
  Descripcion:string,
  Estatus:number;
  Camas:number;
  Personas:number;
  Personas_Extra:number;
  Tarifa:number;
  Inventario?:number,
}
