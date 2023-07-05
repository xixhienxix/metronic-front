import { BaseModel } from '../../../_metronic/shared/crud-table';

export interface Habitacion extends BaseModel
{
  _id?:string,
  Codigo:string,
  Numero:string[],
  Tipo:string,
  Descripcion:string,
  Adultos:number;
  Ninos:number;
  Inventario:number,
  Vista:string,
  Camas:number,
  Tipos_Camas:string[],
  Amenidades:string[],
  Orden:Number,
  Tarifa:number,
  URL?: string;

}
