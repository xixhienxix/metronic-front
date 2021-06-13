import { BaseModel } from '../../../_metronic/shared/crud-table';

export interface Disponibilidad extends BaseModel
{
  Cuarto:string,
  Habitacion:number,
  Estatus:number,
  Dia:number,
  Mes:number,
  Ano:number

}
