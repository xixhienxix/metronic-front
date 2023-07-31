import { Injectable } from '@angular/core';
import {Foliador } from '../_models/foliador.model'
import { Observable, throwError , of, BehaviorSubject } from 'rxjs';
import { HttpClient } from "@angular/common/http";
import {environment} from "../../../../environments/environment"
import { catchError, map, tap  } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class FoliosService {
  private currentFolios$=new BehaviorSubject<Foliador>(undefined);

  get getCurrentFoliosValue(): Foliador {
    return this.currentFolios$.value;
  }

  set setCurrentFoliosValue(foliador: Foliador) {
    this.currentFolios$.next(foliador);
  }

  getFoliosbyLetra(id:string) : Observable<Foliador[]> {
    console.log("BY LETRA = environment.apiUrl + '/reportes/folios'",environment.apiUrl + '/reportes/folios')

  return  (this.http.get<Foliador[]>(environment.apiUrl+"/reportes/folios/"+id)
      .pipe(
        map(responseData=>{

          console.log("MAP",responseData)
          return responseData
        })
      ))
  }

  getFolios() :Observable<Foliador[]> {
   return this.http
    .get<Foliador[]>(environment.apiUrl + '/reportes/folios')
    .pipe(map(
      (value)=>{
        const postArray = []
         for(const key in value)
         {
           if(value.hasOwnProperty(key))
           postArray.push(value[key]);
           this.setCurrentFoliosValue = postArray[0] 
          }
          return value
      }
      ))
  }

  updateFolio(id:number) {
    return this.http
     .put(environment.apiUrl + '/reportes/folio/'+id+'',{ observe: 'response' }).pipe(
      catchError(this.handleError)
     )

   }


   handleError(error) {
    let errorMessage = '';
    if (error.error instanceof ErrorEvent) {
      // client-side error
      errorMessage = `Error: ${error.error.message}`;
    } else {
      // server-side error
      errorMessage = `Error Code: ${error.status}\nMessage: ${error.message}`;
    }
    window.alert(errorMessage);
    return throwError(errorMessage);
  }

  constructor(private http: HttpClient) { }
}
