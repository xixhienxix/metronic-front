import { HttpClient } from '@angular/common/http';
import { Inject, Injectable, OnDestroy } from '@angular/core';
import { BehaviorSubject, forkJoin, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { baseFilter } from 'src/app/_fake/fake-helpers/http-extenstions';
import { GroupingState, ITableState, PaginatorState, SortState, TableResponseModel, TableService } from 'src/app/_metronic/shared/crud-table';
import { environment } from 'src/environments/environment';
import { Disponibilidad } from '../../reportes/_models/disponibilidad.model';
import { Habitacion } from '../_models/habitacion';

const DEFAULT_STATE: ITableState = {
  filter: {},
  paginator: new PaginatorState(),
  sorting: new SortState(),
  searchTerm: '',
  grouping: new GroupingState(),
  entityId: undefined
};

const DEFAULT_HABITACION = {
  Codigo:'',
  Numero:[],
  Tipo:'',
  Descripcion:'',
  Camas:1,
  Personas:1,
  Personas_Extra:1,
  Inventario:1,
  Vista:'',
  Amenidades:[],
  Tipos_Camas:[],
  Orden:1,
  Tarifa:0
}
// Codigo:string,
// Numero:string[],
// Tipo:string,
// Descripcion:string,
// Personas:number;
// Personas_Extra:number;
// Inventario:number,
// Vista:string,
// Camas:string[],
// Amenidades:string[]

@Injectable({
  providedIn: 'root'
})
export class HabitacionesService extends TableService<Habitacion> implements OnDestroy  {

  API_URL = `${environment.apiUrl}/codigos/habitaciones`;
  /*Oservables*/
  HabitacionUpdate$: Observable<Habitacion>;
  private currentHabitacion$=new BehaviorSubject<Habitacion>(DEFAULT_HABITACION);
  
  constructor(@Inject(HttpClient) http) {
    super(http);
    this.HabitacionUpdate$=this.currentHabitacion$.asObservable();
   }

   get getcurrentHabitacionValue(): Habitacion {
    return this.currentHabitacion$.value;
  }

  set setcurrentHabitacionValue(Habitacion: Habitacion) {
    this.currentHabitacion$.next(Habitacion);
  }

  getAll() :Observable<Habitacion[]> {
    return this.http
     .get<Habitacion[]>(environment.apiUrl + '/codigos/habitaciones')
     .pipe(
       map(responseData=>{
       return responseData
     })
     )

   }

   

  // READ
  find(tableState: ITableState): Observable<TableResponseModel<Habitacion>> {
    return this.http.get<Habitacion[]>(this.API_URL).pipe(
      map((response: Habitacion[]) => {
        const filteredResult = baseFilter(response, tableState);
        const result: TableResponseModel<Habitacion> = {
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

  updateHabitacion(Habitacion:Habitacion)
  {
    return this.http.post(environment.apiUrl+'/habitacion/actualiza/Habitacion',{Habitacion})
  }

  updateHabitacionModifica(HabitacionAnterior:any)
  {
    return this.http
    .post(environment.apiUrl+'/habitacion/actualiza/Habitacion/modifica',HabitacionAnterior)
  }

  modificaHabitacion(codigo,numero,llegada,salida)
  {
    return this.http
    .post(environment.apiUrl+'/habitacion/actualiza/Habitacion',{codigo:codigo,numero:numero,llegada:llegada,salida:salida})
  }

  deleteHabitacion(_id:string){
    return this.http
    .delete(environment.apiUrl+'/habitacion/delete/'+_id)
  }

  postAdicional(descripcion:string,precio:number)
  {
    return this.http
    .post(environment.apiUrl+'/codigos/adicional',{descripcion,precio})
  }

  postHabitacion(habitacion:Habitacion,editar:boolean){
    return this.http.post(environment.apiUrl+'/habitacion/guardar',{habitacion,editar})
  }

  agregarInventario(habitacion:Habitacion,inventario:number){
    return this.http.post(environment.apiUrl+'/habitacion/agregar',{habitacion,inventario})
  }

  buscarHabitacion(habitacion:Habitacion){
    return this.http.post<Habitacion[]>(environment.apiUrl+'/habitacion/buscar',{habitacion})
  }

  getCodigohabitaciones() :Observable<Habitacion[]> {

    return this.http
     .get<Habitacion[]>(environment.apiUrl + '/reportes/tipo')
     .pipe(
       map(responseData=>{
       return responseData
     })
     )

   }

   creaDisponibilidad(numeroHabs:any,nombreCuarto:string){
    return this.http.post(environment.apiUrl+'/disponibilidad/crear',{numeroHabs,nombreCuarto}).pipe(
      map(response=>{
        return response
      })
    )
   }

  ngOnDestroy() {
    this.subscriptions.forEach(sb => sb.unsubscribe());
  }
}
