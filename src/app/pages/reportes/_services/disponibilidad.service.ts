import { Injectable } from '@angular/core';
import { Disponibilidad } from '../_models/disponibilidad.model'
import { Observable, of } from 'rxjs';
import { HttpClient,HttpParams } from '@angular/common/http';
import {environment} from "../../../../environments/environment"
import { catchError, map, tap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class DisponibilidadService {
  private listaFolios: Disponibilidad[] = [];


  // getHabitacionesbyTipo(id:string) : Observable<Disponibilidad[]> {

  // return  (this.http.get<Disponibilidad[]>(environment.apiUrl+"/huespedes/disponibilidad/estaus"+id)
  //     .pipe(
  //       map(responseData=>{
  //         return responseData
  //       })
  //     ))
  // }
  // consultaDisponibilidad(fechas:String[],cuarto:string){
  //   for (let i=0; i<fechas.length; i++){
  //     console.log("Fechas lenght",fechas.length)
  //     this.getdisponibilidad(fechas[0],cuarto)
  //     console.log(fechas[0])
  //     i++
  //   }
  // }

  getdisponibilidad(dia:string,mes:string,ano:string,cuarto:string) :Observable<Disponibilidad[]> {
    const params = new HttpParams()
    .set('dia', dia)
    .set('mes', mes)
    .set('ano',ano)
    .set('cuarto',cuarto)
    console.log(environment.apiUrl + '/huespedes/disponibilidad/:dia/:mes/:ano/:cuarto'+{params:params})

    return this.http
     .get<Disponibilidad[]>(environment.apiUrl + '/huespedes/disponibilidad/:dia/:mes/:ano/:cuarto'+{params:params})
     .pipe(
       map(responseData=>{
       return responseData
     })
     )
   }
  // getCodigohabitaciones() :Observable<Disponibilidad[]> {
  //   return this.http
  //    .get<Disponibilidad[]>(environment.apiUrl + '/reportes/tipo')
  //    .pipe(
  //      map(responseData=>{
  //      return responseData
  //    })
  //    )

  //  }

  constructor(private http: HttpClient) { }
}
