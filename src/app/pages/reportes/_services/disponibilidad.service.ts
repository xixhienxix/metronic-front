import { Injectable } from '@angular/core';
import { Disponibilidad } from '../_models/disponibilidad.model'
import { Observable, of } from 'rxjs';
import { HttpClient,HttpParams } from '@angular/common/http';
import {environment} from "../../../../environments/environment"
import { catchError, map, tap } from 'rxjs/operators';
import { HabitacionesService }  from './habitaciones.service'
import { DateTime } from 'luxon'
import { NumberLiteralType } from 'typescript';
import { ParametrosServiceService } from '../../parametros/_services/parametros.service.service';
@Injectable({
  providedIn: 'root'
})
export class DisponibilidadService {
  private mySet = new Set();
  private dispo:any[] = []

  getDisponibilidadCompleta(llegada:string,salida:string,tipoCuarto:string,numeroCuarto:string,dias:number,folio:number){

    const params = new HttpParams()
    .set('llegada', llegada)
    .set('salida', salida)
    .set('cuarto',tipoCuarto)
    .set('numeroCuarto',numeroCuarto.toString())
    .set('dias',dias.toString())
    .set('folio',folio.toString())
    .append("hotel",this._parametrosService.getCurrentParametrosValue.hotel);

    return this.http.get<any>(environment.apiUrl+'/disponibilidad/completa',{params:params})

  }

  getdisponibilidad(dia:number,mes:number,ano:number,cuarto:string) :Observable<Disponibilidad[]> {
    const params = new HttpParams()
    .set('dia', dia.toString())
    .set('mes', mes.toString())
    .set('ano',ano.toString())
    .set('cuarto',cuarto.toString())
    .append("hotel",this._parametrosService.getCurrentParametrosValue.hotel);

    return this.http
     .get<Disponibilidad[]>(environment.apiUrl + '/huespedes/disponibilidad',{params:params})
     .pipe(
       map(responseData=>{
       return responseData
     })
     )
   }

  getDisponibilidadAnual(dia:number,mes:number,ano:number){
    const params = new HttpParams()
    .set('dia', dia.toString())
    .set('mes', mes.toString())
    .set('ano',ano.toString())
    .append("hotel",this._parametrosService.getCurrentParametrosValue.hotel);

    return this.http.get<Disponibilidad[]>(environment.apiUrl + '/huespedes/disponibilidad/todos',{params:params})
  }

   actualizaDisponibilidad(disponibilidad:Disponibilidad){
    const hotel = this._parametrosService.getCurrentParametrosValue.hotel

    return this.http.put(environment.apiUrl+"/update/disponibilidad",{disponibilidad,hotel})
   }

   getEstatusAmaDeLlaves(dia:number,mes:number,ano:number,numeroCuarto:string,habitacion:string){

    const hotel = this._parametrosService.getCurrentParametrosValue.hotel

    let parametros = {
      dia:dia,
      mes:mes,
      ano:ano,
      numeroCuarto:numeroCuarto,
      habitacion:habitacion,
      hotel:hotel
      };

     return this.http.post<Disponibilidad>(environment.apiUrl+'/disponibilidad/ama',parametros)

  }

  constructor(private http: HttpClient,
    private _parametrosService:ParametrosServiceService,
    public habitacionesService : HabitacionesService,
    ) { }
}
