import { HttpClient } from '@angular/common/http';
import { Inject, Injectable } from '@angular/core';
import { BehaviorSubject, Observable, Subject } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from 'src/environments/environment';
import { Amenidades } from '../_models/amenidades';
import { Tipos_Habitacion } from '../_models/tipos';
import { Adicional } from '../_models/adicionales';
import { Camas } from '../_models/camas';


const DEFAULT_TIPO: Tipos_Habitacion = {
  Descripcion:'',
  Tipo:'HAB'
};


@Injectable({
  providedIn: 'root'
})
export class TiposService {

  public adicionalSubject = new BehaviorSubject<Adicional[]>(null)
  private subject =new Subject<any>();
  
  constructor(private http:HttpClient) {
   }


  sendNotification(value:any){
    this.subject.next({text:value});
  }

  getNotification(){   //this will be subscribed by the listing component which needs to display the //added/deleted ie updated list.
        return this.subject.asObservable();
  }

  getTiposDeCuarto() :Observable<Tipos_Habitacion[]> {
    return this.http
     .get<Tipos_Habitacion[]>(environment.apiUrl + '/codigos/tipos_habitacion')
     .pipe(
       map(responseData=>{
       return responseData
     })
     )

   }

   getAmenidades() :Observable<Tipos_Habitacion[]> {
    return this.http
     .get<Amenidades[]>(environment.apiUrl + '/codigos/amenidades')
     .pipe(
       map(responseData=>{
       return responseData
     })
     )

   }

   getCamas() :Observable<Tipos_Habitacion[]> {
    return this.http
     .get<Camas[]>(environment.apiUrl + '/codigos/camas')
     .pipe(
       map(responseData=>{
       return responseData
     })
     )

   }

}
