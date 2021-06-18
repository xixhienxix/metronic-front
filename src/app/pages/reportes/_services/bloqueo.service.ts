import { Injectable } from '@angular/core';
import { Bloqueo } from '../_models/bloqueo.model'
import { Observable, of } from 'rxjs';
import { HttpClient } from "@angular/common/http";
import {environment} from "../../../../environments/environment"
import { catchError, map, tap } from 'rxjs/operators';



@Injectable({
  providedIn: 'root'
})
export class BloqueoService  {


  getBloqueosbyTipo(id:string) : Observable<Bloqueo[]> {

  return  (this.http.get<Bloqueo[]>(environment.apiUrl+"/reportes/bloqueos/"+id)
      .pipe(
        map(responseData=>{

          console.log("MAP",responseData)
          return responseData
        })
      ))
  }

  getBloqueosbyId(id:string) : Observable<Bloqueo[]> {

    return  (this.http.get<Bloqueo[]>(environment.apiUrl+"/get/bloqueos/"+id)
        .pipe(
          map(responseData=>{

            console.log("MAP",responseData)
            return responseData
          })
        ))
    }

  getBloqueos() :Observable<Bloqueo[]> {
   return this.http
    .get<Bloqueo[]>(environment.apiUrl + '/reportes/bloqueos')
    .pipe(
      map(responseData=>{
      return responseData
    })
    )

  }

  constructor(private http: HttpClient) { }
}
