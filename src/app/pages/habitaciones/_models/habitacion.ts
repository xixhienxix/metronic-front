import { BaseModel } from '../../../_metronic/shared/crud-table';

export interface Habitacion extends BaseModel
{
  Codigo:string,
  Numero:string[],
  Tipo:string,
  Descripcion:string,
  Personas:number;
  Personas_Extra:number;
  Inventario:number,
  Vista:string,
  Camas:string[],
  Amenidades:string[]
}
