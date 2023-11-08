import { Injectable } from '@angular/core';
import { Habitaciones } from '../_models/habitaciones.model'
import { Observable, of } from 'rxjs';
import { HttpClient,HttpParams } from "@angular/common/http";
import {environment} from "../../../../environments/environment"
import { catchError, map, tap } from 'rxjs/operators';
import { ParametrosServiceService } from '../../parametros/_services/parametros.service.service';

@Injectable({
  providedIn: 'root'
})
export class HabitacionesService {
  private listaFolios: Habitaciones[] = [];


  getHabitacionesbyTipo(id:string) : Observable<Habitaciones[]> {
    const hotel = sessionStorage.getItem("HOTEL");
    let queryParams = new HttpParams();
    queryParams = queryParams.append("hotel",hotel);

  return  (this.http.get<Habitaciones[]>(environment.apiUrl+"/reportes/habitaciones/"+id,{params:queryParams})
      .pipe(
        map(responseData=>{
          return responseData
        })
      ))
  }

  getHabitacionbyNumero(numero:string) : Observable<Habitaciones[]> {
    const hotel = sessionStorage.getItem("HOTEL");
    let queryParams = new HttpParams();
    queryParams = queryParams.append("hotel",hotel);

    return  (this.http.get<Habitaciones[]>(environment.apiUrl+"/reportes/habitacion/"+numero,{params:queryParams})
        .pipe(
          map(responseData=>{
            return responseData
          })
        ))
    }

  gethabitaciones() :Observable<Habitaciones[]> {
    let queryParams = new HttpParams();
    queryParams = queryParams.append("hotel",sessionStorage.getItem("HOTEL"));

   return this.http
    .get<Habitaciones[]>(environment.apiUrl + '/reportes/habitaciones',{params:queryParams})
  }

  getInfoHabitaciones(numero:string,tipo:string) :Observable<Habitaciones[]> {
    const params = new HttpParams()
    .set('numero', numero.toString())
    .set('tipo', tipo)
    .append("hotel",sessionStorage.getItem("HOTEL"));

    return this.http
     .get<Habitaciones[]>(environment.apiUrl + '/info/habitaciones', {params:params})
     .pipe(
       map(responseData=>{
       return responseData
     })
     )

   }

  getCodigohabitaciones() :Observable<Habitaciones[]> {
    let queryParams = new HttpParams();
    queryParams = queryParams.append("hotel",sessionStorage.getItem("HOTEL"));

    return this.http
     .get<Habitaciones[]>(environment.apiUrl + '/reportes/tipo',{params:queryParams})
     .pipe(
       map(responseData=>{
       return responseData
     })
     )

   }

  constructor(private http: HttpClient, private _parametrosService:ParametrosServiceService) { }
}
