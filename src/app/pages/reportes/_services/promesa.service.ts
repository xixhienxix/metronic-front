import { HttpClient, HttpParams } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { map } from "rxjs/operators";
import { environment } from "src/environments/environment";
import { Promesa } from "../_models/promesa.model";
import { ParametrosServiceService } from "../../parametros/_services/parametros.service.service";

@Injectable({
    providedIn: 'root'
  })
export class PromesaService {

    constructor(
        private http : HttpClient,
        private _parametrosService:ParametrosServiceService
    ){}

    borrarPromesa(_id:string){
        return this.http.delete(environment.apiUrl+'/reportes/promesa/delete/'+_id)
    }

    guardarPromesa (folio:number,fecha:Date,cantidad:number,estatus:string){
        return this.http.post(environment.apiUrl+'/reportes/promesa',{folio:folio,fecha:fecha,cantidad:cantidad,estatus:estatus})
      }

    getPromesas(folio:number ){
        let queryParams = new HttpParams();
        queryParams = queryParams.append("hotel",this._parametrosService.getCurrentParametrosValue.hotel);
        
        return this.http.get<Promesa[]>(environment.apiUrl+'/reportes/promesas/'+folio,{params:queryParams})
        .pipe(
            map((datosCuenta)=>{
            let promesa:Promesa[]=[];
              for(let i=0;i<datosCuenta.length;i++)
              {

                    promesa.push(datosCuenta[i])
              }

              return promesa    
          }))
        

    }
    updatePromesa(id:string,estatus:string){
        return this.http.put(environment.apiUrl+"/reportes/promesas/update",{id,estatus})
    }
    updatePromesaEstatus(id:string,estatus:string){
            return this.http.put(environment.apiUrl+"/reportes/promesas/update/estatus",{id,estatus})
        
    }
}