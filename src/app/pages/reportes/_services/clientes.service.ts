import { HttpClient } from '@angular/common/http';
import { Inject, Injectable, OnDestroy } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { environment } from 'src/environments/environment';
import { TableService, TableResponseModel, ITableState, BaseModel, PaginatorState, SortState, GroupingState } from '../../../_metronic/shared/crud-table';
import { Huesped } from '../_models/customer.model';
const EMPTY_CUSTOMER: Huesped = {
  id:undefined,
  folio:undefined,
  adultos:1,
  ninos:1,
  nombre: '',
  estatus:'',
  // llegada: date.getDay().toString()+'/'+date.getMonth()+'/'+date.getFullYear(),
  // salida: (date.getDay()+1).toString()+'/'+date.getMonth()+'/'+date.getFullYear(),
  llegada:'',
  salida:'',
  noches: 1,
  tarifa:'Tarifa Rack',
  porPagar: 500,
  pendiente:500,
  origen: 'Online',
  habitacion: "",
  telefono:"",
  email:"",
  motivo:"",
  //OTROS DATOs
  fechaNacimiento:'',
  trabajaEn:'',
  tipoDeID:'',
  numeroDeID:'',
  direccion:'',
  pais:'',
  ciudad:'',
  codigoPostal:'',
  lenguaje:'Español',
  numeroCuarto:'0',
  creada: new Date().toString(),
  tipoHuesped:"Regular"
};
const DEFAULT_STATE: ITableState = {
  filter: {},
  paginator: new PaginatorState(),
  sorting: new SortState(),
  searchTerm: '',
  grouping: new GroupingState(),
  entityId: undefined
};

@Injectable({
  providedIn: 'root'
})
export class ClientesService extends TableService<Huesped> implements OnDestroy  {
  
  huespedUpdate$: any;
  private currentHuesped$=new BehaviorSubject<Huesped>(EMPTY_CUSTOMER);


  constructor(@Inject(HttpClient) http) {
    super(http);
    this.huespedUpdate$=this.currentHuesped$.asObservable();
  }

  getClientes(){
    return this.http.get(environment.apiUrl+'/reportes/clientes')
  }

  ngOnDestroy() {
    this.subscriptions.forEach(sb => sb.unsubscribe());
  }
}
