import { Injectable } from '@angular/core';
import {Foliador } from '../_models/foliador.model'
import { Observable, throwError , of } from 'rxjs';
import { HttpClient } from "@angular/common/http";
import {environment} from "../../../../environments/environment"
import { catchError, map, tap  } from 'rxjs/operators';
import { Tarifas } from '../_models/tarifas';


@Injectable({
  providedIn: 'root'
})
export class TarifaService {


  getTarifas() :Observable<Tarifas[]> {
   return this.http
    .get<Tarifas[]>(environment.apiUrl + '/tarifario/tarifas')
    .pipe(
      map(responseData=>{
      return responseData
    })
    )

  }

  constructor(private http: HttpClient) { }
}
