import { HttpClient } from '@angular/common/http';
import { Inject, Injectable, OnDestroy } from '@angular/core';
import { BehaviorSubject, forkJoin, Observable, Subject } from 'rxjs';
import { exhaustMap, map } from 'rxjs/operators';
import { baseFilter } from 'src/app/_fake/fake-helpers/http-extenstions';
import { GroupingState, ITableState, PaginatorState, SortState, TableResponseModel, TableService } from 'src/app/_metronic/shared/crud-table';
import { environment } from 'src/environments/environment';
import { Tarifas } from '../_models/tarifas';

const DEFAULT_STATE: ITableState = {
  filter: {},
  paginator: new PaginatorState(),
  sorting: new SortState(),
  searchTerm: '',
  grouping: new GroupingState(),
  entityId: undefined
};

const DEFAULT_TARIFA = {
  Tarifa:'',
  Habitacion:[],
  Llegada:'',
  Salida:'',
  Plan:'',
  Politicas:'',
  EstanciaMinima:1,
  EstanciaMaxima:1,
  Estado:true,
  TarifaRack:0,
  Tarifa1Persona:0,
  Tarifa2Persona:0,
  Tarifa3Persona:0,
  Tarifa4Persona:0,
  Dias:[
    {name:'Lun', value:'0', checked:false},
    {name:'Mar', value:'1', checked:false},
    {name:'Mie', value:'2', checked:false},
    {name:'Jue', value:'3', checked:false},
    {name:'Vie', value:'4', checked:false},
    {name:'Sab', value:'5', checked:false},
    {name:'Dom', value:'6', checked:false}
  ]
}



@Injectable({
  providedIn: 'root'
})
export class TarifasService extends TableService<Tarifas> implements OnDestroy {

  API_URL = `${environment.apiUrl}/tarifario/Tarifas`;
  /*Oservables*/
  TarifasUpdate$: Observable<Tarifas>;
  private currentTarifas$=new BehaviorSubject<Tarifas>(DEFAULT_TARIFA);
  private subject =new Subject<any>();

  constructor(@Inject(HttpClient) http) {
    super(http);
    this.TarifasUpdate$=this.currentTarifas$.asObservable();

  }
  sendNotification(value:any)
  {
      this.subject.next({text:value});
  }

  //this will be subscribed by the listing component which needs to display the //added/deleted ie updated list.

  getNotification(){
      return this.subject.asObservable();
  }

  get getCurrentTarifasValue(): Tarifas {
    return this.currentTarifas$.value;
  }

  set setCurrentTarifasValue(Tarifas: Tarifas) {
    this.currentTarifas$.next(Tarifas);
  }

  getAll() :Observable<Tarifas[]> {
    return this.http
     .get<Tarifas[]>(environment.apiUrl + '/tarifario/tarifas')
     .pipe(
       map(responseData=>{
       return responseData
     })
     )

   }

   getTarifaRack() :Observable<Tarifas[]> {
    return this.http
     .get<Tarifas[]>(environment.apiUrl + '/tarifario/tarifas/rack')
     .pipe(
       map(responseData=>{
       return responseData
     })
     )

   }

  // READ
  find(tableState: ITableState): Observable<TableResponseModel<Tarifas>> {
    return this.http.get<Tarifas[]>(this.API_URL).pipe(
      map((response: Tarifas[]) => {
        const filteredResult = baseFilter(response, tableState);
        const result: TableResponseModel<Tarifas> = {
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

  postTarifa(tarifa:Tarifas){
    return this.http.post(environment.apiUrl+'/tarifas/agregar',{tarifa}).pipe(
      map((data=>{
        this.sendNotification(true);
        }
    )));
  }

  postTarifaEspecial(tarifa:Tarifas){
    return this.http.post(environment.apiUrl+'/tarifas/especial/agregar',{tarifa}).pipe(
      map((data=>{
        this.sendNotification(true);
        }
    )));
  }

  updateTarifas(Tarifas:Tarifas)
  {
    return this.http.post(environment.apiUrl+'/tarifario/actualiza/tarifas',{Tarifas})
  }

  updateTarifasModifica(TarifasAnterior:any)
  {
    return this.http
    .post(environment.apiUrl+'/tarifario/actualiza/tarifas/modifica',TarifasAnterior)
  }

  modificaTarifas(codigo,numero,llegada,salida)
  {
    return this.http
    .post(environment.apiUrl+'/tarifario/actualiza/tarifas',{codigo:codigo,numero:numero,llegada:llegada,salida:salida})
  }

  deleteTarifas(tarifa:Tarifas){
    return this.http.post(environment.apiUrl+'/tarifas/rack/delete',{tarifa}).pipe(
      map((data=>{
        this.sendNotification(true);
        }
    )));
  }

  ngOnDestroy() {
    this.subscriptions.forEach(sb => sb.unsubscribe());
  }
}
