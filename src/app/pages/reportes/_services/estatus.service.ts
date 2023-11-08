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

    const hotel = sessionStorage.getItem("HOTEL");
    let queryParams = new HttpParams();
    queryParams = queryParams.append("hotel",hotel);
    
  return  (this.http.get<Estatus[]>(environment.apiUrl+"/reportes/estatus/"+id,{params:queryParams})
      .pipe(
        map(responseData=>{

          console.log("MAP",responseData)
          return responseData
        })
      ))
  }



  getEstatus() :Observable<Estatus[]> {
    let queryParams = new HttpParams();
    queryParams = queryParams.append("hotel",sessionStorage.getItem("HOTEL"));

   return this.http
    .get<Estatus[]>(environment.apiUrl + '/reportes/estatus',{params:queryParams})
    .pipe(
      map(responseData=>{
      return responseData
    })
    )

  }

  actualizaEstatus(estatus,folio,huesped:Huesped){

    const hotel = sessionStorage.getItem("HOTEL");
    let queryParams = new HttpParams();
    queryParams = queryParams.append("hotel",hotel);

    return this.http.post(environment.apiUrl+"/actualiza/estatus",{estatus:estatus,folio:folio,huesped:huesped,params:queryParams})

  }


  constructor(private http: HttpClient, private _parametrosService:ParametrosServiceService) { }
}
