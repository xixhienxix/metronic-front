import { Injectable, OnDestroy, Inject, Component } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { BehaviorSubject, forkJoin, Observable } from 'rxjs';
import { exhaustMap, map } from 'rxjs/operators';
import { TableService, TableResponseModel, ITableState, BaseModel, PaginatorState, SortState, GroupingState } from '../../../_metronic/shared/crud-table';
import { Huesped } from '../_models/customer.model';
import { baseFilter } from '../../../_fake/fake-helpers/http-extenstions';
import { environment } from '../../../../environments/environment';
import { Router } from '@angular/router';
import { Habitaciones } from '../_models/habitaciones.model';
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
  tarifa:'',
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

export class HuespedService extends TableService<Huesped> implements OnDestroy {
   API_URL = `${environment.apiUrl}/reportes/huesped`;
   /*Oservables*/
   huespedUpdate$: Observable<Huesped>;
   private currentHuesped$=new BehaviorSubject<Huesped>(EMPTY_CUSTOMER);


  constructor(@Inject(HttpClient) http) {
    super(http);
    this.huespedUpdate$=this.currentHuesped$.asObservable();

  }
  //
  
  get getCurrentHuespedValue(): Huesped {
    return this.currentHuesped$.value;
  }

  set setCurrentHuespedValue(huesped: Huesped) {
    this.currentHuesped$.next(huesped);
  }

  getAll() :Observable<Huesped[]> {
    return this.http
     .get<Huesped[]>(environment.apiUrl + '/reportes/huesped')
     .pipe(
       map(responseData=>{
       return responseData
     })
     )

   }

  // READ
  find(tableState: ITableState): Observable<TableResponseModel<Huesped>> {
    let queryParams = new HttpParams();
    queryParams = queryParams.append("hotel",this._parametrosService.getCurrentParametrosValue.hotel);
    
    return this.http.get<Huesped[]>(this.API_URL,{params:queryParams}).pipe(
      map((response: Huesped[]) => {
        const filteredResult = baseFilter(response, tableState);
        const result: TableResponseModel<Huesped> = {
          items: filteredResult.items,
          total: filteredResult.total
        };
        return result;
      })
    );
  }

  deleteItems(ids: number[] = []): Observable<any> {
    const tasks$ = [];
    ids.forEach(id => {
      tasks$.push(this.delete(id));
    });
    return forkJoin(tasks$);
  }

  updateStatusForItems(ids: number[], status: number): Observable<any> {
    let queryParams = new HttpParams();
    queryParams = queryParams.append("hotel",this._parametrosService.getCurrentParametrosValue.hotel);

    return this.http.get<Huesped[]>(this.API_URL,{params:queryParams}).pipe(
      map((huespedes: Huesped[]) => {
        return huespedes.filter(c => ids.indexOf(c.id ) > -1).map(c => {
          c.noches = status;
          return c;
        });
      }),
      exhaustMap((huespedes: Huesped[]) => {
        const tasks$ = [];
        huespedes.forEach(huespedes => {
          tasks$.push(this.update(huespedes));
        });
        return forkJoin(tasks$);
      })
    );
  }

  addPost(huesped:Huesped) {
    return this.http.post<any>(environment.apiUrl+"/reportes/huesped", huesped)
    }

  updateEstatusHuesped(huesped:Huesped)
  {
    return this.http
    .post(environment.apiUrl+'/reportes/actualiza/estatus/huesped',huesped)
  }

  updateHuesped(huesped:Huesped)
  {
    return this.http.post(environment.apiUrl+'/reportes/actualiza/huesped',{huesped})
  }

  
  updateHuespedModifica(huespedAnterior:any)
  {
    return this.http
    .post(environment.apiUrl+'/reportes/actualiza/huesped/modifica',huespedAnterior)
  }

  modificaHuesped(codigo,numero,llegada,salida)
  {
    return this.http
    .post(environment.apiUrl+'/reportes/actualiza/huesped',{codigo:codigo,numero:numero,llegada:llegada,salida:salida})
  }

  deleteHuesped(_id:string){
    return this.http
    .delete(environment.apiUrl+'/huesped/delete/'+_id)
  }

  ngOnDestroy() {
    this.subscriptions.forEach(sb => sb.unsubscribe());
  }
}
