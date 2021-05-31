import { BaseModel } from '../../../_metronic/shared/crud-table';

export interface Huesped extends BaseModel {

  // id: number;
  folio:number
  adultos:number;
  ninos:number;
  nombre: string;
  // apellido: string;
  estatus: number; // Huesped en Casa = 1 | Reserva Sin Pagar = 2 | Reserva Confirmada = 3 | Hizo Checkout = 4 | Uso Interno = 5 | Bloqueo = 6 | Reserva Temporal = 7
  llegada: string;
  salida: string;
  noches: number;
  tarifa:number;
  porPagar: number;
  pendiente: number;
  origen: string;
  habitacion: number;  // Chardonay = 1 | Cabernet = 2 | Shiraz = 3 | Malbec = 4 | La Vid = 5 | Merlot = 6 | Pinot Noir = 7
  telefono:string;
  email:string;
  motivo:string;
  //Otros Detalles
  fechaNacimiento:string;
  trabajaEn:string;
  tipoDeID:string;
  numeroDeID:string;
  direccion:string;
  pais:string;
  ciudad:string;
  codigoPostal:string;
  lenguaje:string;
}
export interface Estatus extends BaseModel
{
  id:number,
  nombre:string;
}
