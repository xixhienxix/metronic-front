import { BaseModel } from '../../../_metronic/shared/crud-table';

export interface Habitaciones extends BaseModel
{
  Codigo:string,
  Numero:string,
  Descripcion:string,
  Estatus:number;
  Camas:number;
  Adultos:number;
  Ninos:number;
  Tarifa:number;
  hotel?:string;

}
