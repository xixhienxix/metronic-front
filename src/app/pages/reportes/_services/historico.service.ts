import { Injectable, OnDestroy, Inject, Component } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { BehaviorSubject, forkJoin, Observable, Subject } from 'rxjs';
import { exhaustMap, map } from 'rxjs/operators';
import { TableService, TableResponseModel, ITableState, BaseModel, PaginatorState, SortState, GroupingState } from '../../../_metronic/shared/crud-table';
import { Historico } from '../_models/historico.model';
import { baseFilter } from '../../../_fake/fake-helpers/http-extenstions';
import { environment } from '../../../../environments/environment';
import { Router } from '@angular/router';
import {Huesped} from '../_models/customer.model'
const DEFAULT_STATE: ITableState = {
  filter: {},
  paginator: new PaginatorState(),
  sorting: new SortState(),
  searchTerm: '',
  grouping: new GroupingState(),
  entityId: undefined
};

const EMPTY_HISTORICO:Historico = {
  id_Socio:1,
  habitacion:'',
  llegada:'',
  salida:'',
  numeroCuarto:'0',
  adultos:1,
  creada:'',
  email:'',
  estatus:'',
  estatus_historico:'',
  folio:1,
  motivo:'',
  ninos:1,
  noches:1,
  nombre:'',
  origen:'',
  pendiente:0,
  porPagar:0,
  tarifa:'Tarifa Rack',
  telefono:'',
  tipoHuesped:'',
  fechaNacimiento:'',
  trabajaEn:'',
  tipoDeID:'',
  numeroDeID:'',
  direccion:'',
  pais:'',
  ciudad:'',
  codigoPostal:'',
  lenguaje:'',
  razonsocial:'',
  rfc:'',
  cfdi:''
}

@Injectable({
  providedIn: 'root'
})

export class HistoricoService extends TableService<Historico> implements OnDestroy {
   API_URL = `${environment.apiUrl}/reportes/historico`;
   clienteUpdate$: Observable<Historico>;

   private currentCliente$=new BehaviorSubject<Historico>(EMPTY_HISTORICO);
   private subject =new Subject<any>();

  constructor(@Inject(HttpClient) http) {
    
    super(http);
    this.clienteUpdate$=this.currentCliente$.asObservable();

  }

  get getCurrentClienteValue(): Historico {
    return this.currentCliente$.value;
  }

  set setCurrentClienteValue(cliente: Historico) {
    this.currentCliente$.next(cliente);
  }

  sendNotification(value:any)
  {
      this.subject.next(value);
  }

  getNotification(){
    return this.subject.asObservable();
  }

  //
  getAll() :Observable<Historico[]> {
    let queryParams = new HttpParams();
    queryParams = queryParams.append("hotel",sessionStorage.getItem("HOTEL"));

    return this.http
     .get<Historico[]>(environment.apiUrl + '/reportes/historico',{params:queryParams})
     .pipe(
       map(responseData=>{
       return responseData
     })
     )

   }

   getVisitasById(id:number){
    const hotel = sessionStorage.getItem("HOTEL");
    let queryParams = new HttpParams();
    queryParams = queryParams.append("hotel",hotel);

    return this.http.get<Historico[]>(environment.apiUrl + '/reportes/historico/visitas/'+id,{params:queryParams})
    .pipe(
      map(responseData=>{
      return responseData
    })
    )
   }

  // READ
  find(tableState: ITableState): Observable<TableResponseModel<Historico>> {
    const hotel = sessionStorage.getItem("HOTEL");
    let queryParams = new HttpParams();
    queryParams = queryParams.append("hotel",hotel);

    return this.http.get<Historico[]>(this.API_URL, {params:queryParams}).pipe(
      map((response: Historico[]) => {
        const filteredResult = baseFilter(response, tableState);
        const result: TableResponseModel<Historico> = {
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
    const hotel = sessionStorage.getItem("HOTEL");
    let queryParams = new HttpParams();
    queryParams = queryParams.append("hotel",hotel);

    return this.http.get<Historico[]>(this.API_URL,{params:queryParams}).pipe(
      map((huespedes: Historico[]) => {
        return huespedes.filter(c => ids.indexOf(c.id ) > -1).map(c => {
          c.noches = status;
          return c;
        });
      }),
      exhaustMap((huespedes: Historico[]) => {
        const tasks$ = [];
        huespedes.forEach(huespedes => {
          tasks$.push(this.update(huespedes));
        });
        return forkJoin(tasks$);
      })
    );
  }

  addPost(huesped:Huesped) {
    const hotel = sessionStorage.getItem("HOTEL");
    let queryParams = new HttpParams();
    queryParams = queryParams.append("hotel",hotel);

    return this.http.post<Huesped>(environment.apiUrl+"/guarda/historico", {huesped,params:queryParams})
    }


  updateHistorico(cliente:Historico){
    const hotel = sessionStorage.getItem("HOTEL");
    let queryParams = new HttpParams();
    queryParams = queryParams.append("hotel",hotel);

    const clients=cliente
    console.log(environment.apiUrl)
    return this.http.post<Historico>(environment.apiUrl+"/historico/actualizaDatos",{cliente,params:queryParams}).pipe(
      map((data=>{
        this.sendNotification(cliente);
        }
    )));
  }


  ngOnDestroy() {
    this.subscriptions.forEach(sb => sb.unsubscribe());
  }
}
