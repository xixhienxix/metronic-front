import { Injectable } from '@angular/core';
import { Disponibilidad } from '../_models/disponibilidad.model'
import { Observable, of } from 'rxjs';
import { HttpClient,HttpParams } from '@angular/common/http';
import {environment} from "../../../../environments/environment"
import { catchError, map, tap } from 'rxjs/operators';
import { HabitacionesService }  from './habitaciones.service'
@Injectable({
  providedIn: 'root'
})
export class DisponibilidadService {
  private listaFolios: Disponibilidad[] = [];
  private cuartos : any[]=[];
  private sinDisponibilidad : any[]=[];
  mySet = new Set();


  getdisponibilidad(dia:number,mes:number,ano:number,cuarto:string) :Observable<Disponibilidad[]> {
    const params = new HttpParams()
    .set('dia', dia.toString())
    .set('mes', mes.toString())
    .set('ano',ano.toString())
    .set('cuarto',cuarto.toString())

    return this.http
     .get<Disponibilidad[]>(environment.apiUrl + '/huespedes/disponibilidad',{params:params})
     .pipe(
       map(responseData=>{
       return responseData
     })
     )
   }

   getdisponibilidadTodos(dia:number,mes:number,ano:number) :Observable<Disponibilidad[]> {
    const params = new HttpParams()
    .set('dia', dia.toString())
    .set('mes', mes.toString())
    .set('ano',ano.toString())

    return this.http
     .get<Disponibilidad[]>(environment.apiUrl + '/huespedes/disponibilidad/todos',{params:params})
     .pipe(
       map(responseData=>{
       return responseData
     })
     )
   }

   actualizaDisponibilidad(disponibilidad:Disponibilidad){
    return this.http.put(environment.apiUrl+"/update/disponibilidad",disponibilidad)
   }
  
   getEstatusAmaDeLlaves(dia:number,mes:number,ano:number,numeroCuarto:number,habitacion:string){
    
    let parametros = {
      dia:dia,
      mes:mes,
      ano:ano,
      numeroCuarto:numeroCuarto,
      habitacion:habitacion
      };

     return this.http.post<Disponibilidad>(environment.apiUrl+'/disponibilidad/ama',parametros)

  }

  constructor(private http: HttpClient,
    public habitacionesService : HabitacionesService,
    ) { }
}
