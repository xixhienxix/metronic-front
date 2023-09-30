import { BaseModel } from '../../../_metronic/shared/crud-table';

export interface Estatus extends BaseModel
{
  estatus:string,
  id:number;
  color:string;
  hotel?:string;

}
