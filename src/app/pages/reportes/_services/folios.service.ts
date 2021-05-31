import { Injectable } from '@angular/core';
import {Foliador } from '../_models/foliador.model'
import { Observable, of } from 'rxjs';
import { HttpClient } from "@angular/common/http";
import {environment} from "../../../../environments/environment"
import { catchError, map, tap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class FoliosService {
  private listaFolios: Foliador[] = [];
  // private foliosUpdated = new Subject<Foliador[]>();

  // getFolios(): Observable<Foliador>[] {
  //   const folios = of (FOLIOS);
  //   return folios;
  // }


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
    .pipe(
      map(responseData=>{
      return responseData
    })
    )

  }

  constructor(private http: HttpClient) { }
}
