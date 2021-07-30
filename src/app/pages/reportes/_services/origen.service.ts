import { Injectable } from '@angular/core';
import {Origen } from '../_models/origen.model'
import { Observable, throwError , of } from 'rxjs';
import { HttpClient } from "@angular/common/http";
import {environment} from "../../../../environments/environment"
import { catchError, map, tap  } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class OrigenService {
  private listaOrigen: Origen[] = [];


  getOrigenbyID(id:number) : Observable<Origen>
  {
  return  (this.http.get<Origen>(environment.apiUrl+"/reportes/origen/"+id))
  }

  getOrigenes() :Observable<Origen> {
   return this.http
    .get<Origen>(environment.apiUrl + '/reportes/origen').pipe(
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
