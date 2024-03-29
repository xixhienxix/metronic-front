import { BaseModel } from '../../../_metronic/shared/crud-table';

export interface Historico extends BaseModel {

  // id: number;
  id_Socio:number;
  folio:number
  adultos:number;
  ninos:number;
  nombre: string;
  // apellido: string;
  estatus: string; // Huesped en Casa = 1 | Reserva Sin Pagar = 2 | Reserva Confirmada = 3 | Hizo Checkout = 4 | Uso Interno = 5 | Bloqueo = 6 | Reserva Temporal = 7
  llegada: string;
  salida: string;
  noches: number;
  tarifa:string;
  porPagar: number;
  pendiente: number;
  origen: string;
  habitacion: string;
  telefono:string;
  email:string;
  motivo:string;
  creada:string;
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
  numeroCuarto:string;
  estatus_historico:string;
  tipoHuesped:string;
  
  razonsocial:string;
  rfc:string;
  cfdi:string;
  hotel?:string;

  
}

