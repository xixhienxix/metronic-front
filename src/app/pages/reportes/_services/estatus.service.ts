import { Injectable } from '@angular/core';
import { Estatus } from '../_models/estatus.model'
import { Observable, of } from 'rxjs';
import { HttpClient } from "@angular/common/http";
import {environment} from "../../../../environments/environment"
import { catchError, map, tap } from 'rxjs/operators';
import { Huesped } from '../_models/customer.model';



@Injectable({
  providedIn: 'root'
})
export class EstatusService  {


  getEstatusbyLetra(id:string) : Observable<Estatus[]> {

  return  (this.http.get<Estatus[]>(environment.apiUrl+"/reportes/estatus/"+id)
      .pipe(
        map(responseData=>{

          console.log("MAP",responseData)
          return responseData
        })
      ))
  }



  getEstatus() :Observable<Estatus[]> {
   return this.http
    .get<Estatus[]>(environment.apiUrl + '/reportes/estatus')
    .pipe(
      map(responseData=>{
      return responseData
    })
    )

  }

  actualizaEstatus(estatus,folio,huesped:Huesped){

    return this.http.post(environment.apiUrl+"/actualiza/estatus",{estatus:estatus,folio:folio,huesped:huesped})

  }


  constructor(private http: HttpClient) { }
}
