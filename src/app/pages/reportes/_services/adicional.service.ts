import { Injectable, OnDestroy, Inject, Component } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import {Adicional}from '../_models/adicional.model';
import { environment } from 'src/environments/environment';
import { map } from 'rxjs/operators';
import { ParametrosServiceService } from '../../parametros/_services/parametros.service.service';
@Injectable({
  providedIn: 'root'
})
export class AdicionalService  {

    getAdicionales(){
      const hotel = sessionStorage.getItem("HOTEL");
      let queryParams = new HttpParams();
      queryParams = queryParams.append("hotel",hotel);

        return this.http.get<Adicional[]>(environment.apiUrl+"/adicionales")
        .pipe(
          map(responseData=>{
  
            console.log("MAP",responseData)
            return responseData
          })
        )
    }
    
  constructor(private http: HttpClient, private _parametrosService:ParametrosServiceService) { }
}