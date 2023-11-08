import { Injectable } from '@angular/core';
import { Bloqueo } from '../_models/bloqueo.model'
import { Observable, of } from 'rxjs';
import { HttpClient, HttpParams } from "@angular/common/http";
import {environment} from "../../../../environments/environment"
import { catchError, map, tap } from 'rxjs/operators';
import { ParametrosServiceService } from '../../parametros/_services/parametros.service.service';



@Injectable({
  providedIn: 'root'
})
export class BloqueoService  {


  getBloqueosbyTipo(id:string) : Observable<Bloqueo[]> {
    const hotel = sessionStorage.getItem("HOTEL");
    let queryParams = new HttpParams();
    queryParams = queryParams.append("hotel",hotel);

  return  (this.http.get<Bloqueo[]>(environment.apiUrl+"/reportes/bloqueos/"+id,{params:queryParams})
      .pipe(
        map(responseData=>{

          console.log("MAP",responseData)
          return responseData
        })
      ))
  }

  getBloqueosbyId(id:string) : Observable<Bloqueo[]> {
    const hotel = sessionStorage.getItem("HOTEL");
    let queryParams = new HttpParams();
    queryParams = queryParams.append("hotel",hotel);
    
    return  (this.http.get<Bloqueo[]>(environment.apiUrl+"/get/bloqueos/"+id,{params:queryParams})
        .pipe(
          map(responseData=>{

            console.log("MAP",responseData)
            return responseData
          })
        ))
    }

  actualizaBloqueos(
    _id:string,
    desde:string,
    hasta:string,
    cuarto:Array<string>,
    numCuarto:Array<number>,
    sinLlegadasChecked:boolean,
    sinSalidasChecked:boolean,
    fueraDeServicio:boolean,
    comentarios:string
    ) {
      const hotel = sessionStorage.getItem("HOTEL");
      let queryParams = new HttpParams();
      queryParams = queryParams.append("hotel",hotel);

      let bloqueos: Bloqueo = {
                                _id:_id,
                                Habitacion:cuarto,
                                Cuarto:numCuarto,
                                Desde:desde,
                                Hasta:hasta,
                                sinLlegadas:sinLlegadasChecked,
                                sinSalidas:sinSalidasChecked,
                                fueraDeServicio:fueraDeServicio,
                                Comentarios:comentarios.trim(),
                                hotel:hotel
                                };

   return this.http.post<Bloqueo>(environment.apiUrl+"/actualiza/bloqueos", {bloqueos,params:queryParams},{observe:'response'})

      }


  deleteBloqueo(id) {
    const hotel = sessionStorage.getItem("HOTEL");
    let queryParams = new HttpParams();
    queryParams = queryParams.append("hotel",hotel);

   return this.http.delete(environment.apiUrl + "/reportes/borrar-bloqueo/"+id,{observe:'response',params:queryParams})

  }


  getBloqueos() :Observable<Bloqueo[]> {
    
    let queryParams = new HttpParams();
    queryParams = queryParams.append("hotel",this._parametrosService.getCurrentParametrosValue.hotel);

   return this.http
    .get<Bloqueo[]>(environment.apiUrl + '/reportes/bloqueos',{params:queryParams})
    .pipe(
      map(responseData=>{
      return responseData
    })
    )

  }
  postBloqueo(
    _id:string,
    desde:string,
    hasta:string,
    cuarto:Array<string>,
    numCuarto:Array<number>,
    sinLlegadasChecked:boolean,
    sinSalidasChecked:boolean,
    fueraDeServicio:boolean,
    text:string
    ) {
      const hotel = sessionStorage.getItem("HOTEL");
      let queryParams = new HttpParams();
      queryParams = queryParams.append("hotel",hotel);

const bloqueos: Bloqueo = {
_id:_id,
Habitacion:cuarto,
Cuarto:numCuarto,
Desde:desde,
Hasta:hasta,
sinLlegadas:sinLlegadasChecked,
sinSalidas:sinSalidasChecked,
fueraDeServicio:fueraDeServicio,
Comentarios:text,
hotel:hotel
};

 return this.http.post<any>(environment.apiUrl+"/reportes/bloqueos/post", {bloqueos,params:queryParams}, {observe:'response'})

  }

  liberaBloqueos(
    _id:string,
    desde:string,
    hasta:string,
    habitacion:Array<string>,
    numCuarto:Array<number>,
    ) {
      const hotel = sessionStorage.getItem("HOTEL");
      let queryParams = new HttpParams();
      queryParams = queryParams.append("hotel",hotel);

      let bloqueos: Bloqueo = {
                                _id:_id,
                                Habitacion:habitacion,
                                Cuarto:numCuarto,
                                Desde:desde,
                                Hasta:hasta,
                                sinLlegadas:false,
                                sinSalidas:false,
                                fueraDeServicio:false,
                                Comentarios:'',
                                hotel:sessionStorage.getItem("HOTEL")
                                };

  return this.http.post<Bloqueo>(environment.apiUrl+"/libera/bloqueos", {bloqueos,params:queryParams})

      }

  constructor(private http: HttpClient, private _parametrosService:ParametrosServiceService) { }
}
