import { Injectable } from '@angular/core';
import {Foliador } from '../_models/foliador.model'
import { Observable, throwError , of, BehaviorSubject } from 'rxjs';
import { HttpClient, HttpParams } from "@angular/common/http";
import {environment} from "../../../../environments/environment"
import { catchError, map, tap  } from 'rxjs/operators';
import { ParametrosServiceService } from '../../parametros/_services/parametros.service.service';

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
    let queryParams = new HttpParams();
    queryParams = queryParams.append("hotel",this._parametrosService.getCurrentParametrosValue.hotel);
    
  return  (this.http.get<Foliador[]>(environment.apiUrl+"/reportes/folios/"+id,{params:queryParams})
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

  constructor(private http: HttpClient, private _parametrosService:ParametrosServiceService) { }
}
