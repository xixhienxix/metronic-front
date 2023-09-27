import { Injectable } from '@angular/core';
import { Estatus } from '../_models/estatus.model'
import { Observable, of } from 'rxjs';
import { HttpClient, HttpParams } from "@angular/common/http";
import {environment} from "../../../../environments/environment"
import { catchError, map, tap } from 'rxjs/operators';
import { Huesped } from '../_models/customer.model';
import { ParametrosServiceService } from '../../parametros/_services/parametros.service.service';



@Injectable({
  providedIn: 'root'
})
export class EstatusService  {


  getEstatusbyLetra(id:string) : Observable<Estatus[]> {

    let queryParams = new HttpParams();
    queryParams = queryParams.append("hotel",this._parametrosService.getCurrentParametrosValue.hotel);
    
  return  (this.http.get<Estatus[]>(environment.apiUrl+"/reportes/estatus/"+id,{params:queryParams})
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


  constructor(private http: HttpClient, private _parametrosService:ParametrosServiceService) { }
}
