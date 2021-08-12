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

@Injectable({
  providedIn: 'root'
})

export class HistoricoService extends TableService<Historico> implements OnDestroy {
   API_URL = `${environment.apiUrl}/reportes/historico`;
  constructor(@Inject(HttpClient) http) {
    super(http);
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
    return this.http.post<any>(environment.apiUrl+"/reportes/historico", huesped)
    }


  ngOnDestroy() {
    this.subscriptions.forEach(sb => sb.unsubscribe());
  }
}
