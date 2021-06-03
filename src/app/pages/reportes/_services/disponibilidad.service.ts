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


  //  buscaDispo(llegada:string,salida:string,tipoCuarto:string)
  //  {
  //    //DIAS DE DIFERENCIA
  //    let salidaDia=parseInt(salida.split("/")[0])
  //    let salidaMes=parseInt(salida.split("/")[1])
  //    let salidaAno=parseInt(salida.split("/")[2])

  //    let llegadaDia=parseInt(llegada.split("/")[0])
  //    let llegadaMes=parseInt(llegada.split("/")[1])
  //    let llegadaAno=parseInt(llegada.split("/")[2])

  //    let toDate =   new Date(salidaAno, salidaMes - 1, salidaDia);
  //    let fromDate = new Date(llegadaAno, llegadaMes - 1, llegadaDia);
  //    let diaDif = Math.floor((Date.UTC(toDate.getFullYear(), toDate.getMonth(), toDate.getDate()) - Date.UTC(fromDate.getFullYear(), fromDate.getMonth(), fromDate.getDate()) ) / (1000 * 60 * 60 * 24));
  //    //

  //    this.habitacionesService.getHabitacionesbyTipo(tipoCuarto)
  //    .pipe(map(
  //      (responseData)=>{
  //        const postArray = []
  //        for(const key in responseData)
  //        {
  //          if(responseData.hasOwnProperty(key))
  //          postArray.push(responseData[key]);
  //        }
  //        return postArray
  //      }))
  //      .subscribe((cuartos)=>{
  //        this.cuartos=(cuartos)
  //        console.log("buscaDispo this.cuartos",this.cuartos)
  //      })


  //    for (let i=0; i<diaDif; i++) {

  //    this.getdisponibilidad(fromDate.getDate(), fromDate.getMonth()+1, fromDate.getFullYear(),tipoCuarto)
  //    .pipe(map(
  //      (responseData)=>{
  //        const postArray = []
  //        for(const key in responseData)
  //        {
  //          if(responseData.hasOwnProperty(key))
  //           postArray.push(responseData[key]);
  //        }
  //        return postArray
  //      }))
  //      .subscribe((disponibles)=>{
  //        for(i=0;i<disponibles.length;i++)
  //        {
  //          this.listaFolios=(disponibles)
  //          if(disponibles[i].Estatus==0)
  //          {
  //            this.sinDisponibilidad.push(disponibles[i].Habitacion)
  //          }
  //          this.mySet.add(this.listaFolios[i].Habitacion)
  //        }
  //        for(i=0;i<this.sinDisponibilidad.length;i++)
  //        {
  //          this.mySet.delete(this.sinDisponibilidad[i])
  //        }
  //        console.log("MySET: ",this.mySet)
  //        // this.mySet.delete(this.sinDisponibilidad[0])
  //        console.log("sinDiusponibilidad",this.sinDisponibilidad)
  //        console.log("MySET (Delete): ",this.mySet)

  //      })
  //      fromDate.setDate(fromDate.getDate() + 1);
  //    };
  //    return console.log("MY SET COMPLETO",this.mySet);
  //  }


  constructor(private http: HttpClient,
    public habitacionesService : HabitacionesService,
    ) { }
}
