import { Injectable, OnDestroy, Inject, Component } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, forkJoin, Observable } from 'rxjs';
import { exhaustMap, map } from 'rxjs/operators';
import { TableService, TableResponseModel, ITableState, BaseModel, PaginatorState, SortState, GroupingState } from '../../../_metronic/shared/crud-table';
import { Huesped } from '../_models/customer.model';
import { baseFilter } from '../../../_fake/fake-helpers/http-extenstions';
import { environment } from '../../../../environments/environment';
import { Router } from '@angular/router';
import { Habitaciones } from '../_models/habitaciones.model';

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
  constructor(@Inject(HttpClient) http) {
    super(http);
  }
  //
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
    return this.http.get<Huesped[]>(this.API_URL).pipe(
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
    return this.http.get<Huesped[]>(this.API_URL).pipe(
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
    return this.http
    .post(environment.apiUrl+'/reportes/actualiza/huesped',huesped)
  }

  modificaHuesped(codigo,numero,llegada,salida)
  {
    return this.http
    .post(environment.apiUrl+'/reportes/actualiza/huesped',{codigo:codigo,numero:numero,llegada:llegada,salida:salida})
  }

  ngOnDestroy() {
    this.subscriptions.forEach(sb => sb.unsubscribe());
  }
}
