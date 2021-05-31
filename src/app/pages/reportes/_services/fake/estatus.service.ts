import { Injectable, OnDestroy, Inject, Component } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, forkJoin, Observable } from 'rxjs';
import { exhaustMap, map } from 'rxjs/operators';
import { TableService, TableResponseModel, ITableState, BaseModel, PaginatorState, SortState, GroupingState } from '../../../../_metronic/shared/crud-table';
import { Estatus } from '../../_models/customer.model';
import { baseFilter } from '../../../../_fake/fake-helpers/http-extenstions';
import { environment } from '../../../../../environments/environment';
import { Router } from '@angular/router';

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
export class EstatusService extends TableService<Estatus> implements OnDestroy {
  API_URL = `${environment.apiUrl}/estatus`;
  constructor(@Inject(HttpClient) http) {
    super(http);
  }

  // READ
  find(tableState: ITableState): Observable<TableResponseModel<Estatus>> {
    return this.http.get<Estatus[]>(this.API_URL).pipe(
      map((response: Estatus[]) => {
        const filteredResult = baseFilter(response, tableState);
        const result: TableResponseModel<Estatus> = {
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
    return this.http.get<Estatus[]>(this.API_URL).pipe(
      map((estatus: Estatus[]) => {
        return estatus.filter(c => ids.indexOf(c.id) > -1).map(c => {
          c.id = status;
          return c;
        });
      }),

      exhaustMap((huespedes: Estatus[]) => {
        const tasks$ = [];
        huespedes.forEach(huespedes => {
          tasks$.push(this.update(huespedes));
        });
        return forkJoin(tasks$);
      })
    );
  }

  ngOnDestroy() {
    this.subscriptions.forEach(sb => sb.unsubscribe());
  }
}