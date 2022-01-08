import { Injectable, OnDestroy, Inject, Component } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, forkJoin, Observable } from 'rxjs';
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

const EMPTY_HISTORICO = {
  id_Socio:1,
  habitacion:'',
  llegada:'',
  salida:'',
  numeroCuarto:0,
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
  tarifa:0,
  telefono:'',
  tipoHuesped:''
}

@Injectable({
  providedIn: 'root'
})

export class HistoricoService extends TableService<Historico> implements OnDestroy {
   API_URL = `${environment.apiUrl}/reportes/historico`;
   clienteUpdate$: Observable<Historico>;

   private currentCliente$=new BehaviorSubject<Historico>(EMPTY_HISTORICO);

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
  //
  getAll() :Observable<Historico[]> {
    return this.http
     .get<Historico[]>(environment.apiUrl + '/reportes/historico')
     .pipe(
       map(responseData=>{
       return responseData
     })
     )

   }

  // READ
  find(tableState: ITableState): Observable<TableResponseModel<Historico>> {
    return this.http.get<Historico[]>(this.API_URL).pipe(
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
    return this.http.get<Historico[]>(this.API_URL).pipe(
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
    return this.http.post<Huesped>(environment.apiUrl+"/guarda/historico", huesped)
    }


  ngOnDestroy() {
    this.subscriptions.forEach(sb => sb.unsubscribe());
  }
}
