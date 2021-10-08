import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { map } from "rxjs/operators";
import { environment } from "src/environments/environment";
import { Promesa } from "../_models/promesa.model";

@Injectable({
    providedIn: 'root'
  })
export class PromesaService {

    constructor(
        private http : HttpClient
    ){}

    borrarPromesa(_id:string){
        return this.http.delete(environment.apiUrl+'/reportes/promesa/delete/'+_id)
    }

    guardarPromesa (folio:number,fecha:string,cantidad:number){
        let fechas = fecha.split(" ")[0]
        return this.http.post(environment.apiUrl+'/reportes/promesa',{folio:folio,fecha:fechas,cantidad:cantidad})
      }

    getPromesas(folio:number ){
        return this.http.get<Promesa[]>(environment.apiUrl+'/reportes/promesas/'+folio)
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
}