import { HttpClient } from '@angular/common/http';
import { Inject, Injectable, OnDestroy } from '@angular/core';
import { BehaviorSubject, forkJoin, Observable } from 'rxjs';
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
  Tarfia:'',
  Habitacion:'',
  Plan:'',
  Politicas:'',
  Dias:'',
  Estado:''
}

@Injectable({
  providedIn: 'root'
})
export class TarifasService extends TableService<Tarifas> implements OnDestroy {

  API_URL = `${environment.apiUrl}/tarifario/Tarifas`;
  /*Oservables*/
  TarifasUpdate$: Observable<Tarifas>;
  private currentTarifas$=new BehaviorSubject<Tarifas>(DEFAULT_TARIFA);

  constructor(@Inject(HttpClient) http) {
    super(http);
    this.TarifasUpdate$=this.currentTarifas$.asObservable();

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

  deleteTarifas(_id:string){
    return this.http
    .delete(environment.apiUrl+'/Tarifas/delete/'+_id)
  }

  ngOnDestroy() {
    this.subscriptions.forEach(sb => sb.unsubscribe());
  }
}
