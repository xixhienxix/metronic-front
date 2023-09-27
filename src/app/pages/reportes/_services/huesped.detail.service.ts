import { HttpClient, HttpParams } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { environment } from "src/environments/environment";
import { Huesped_Detail } from "../_models/huesped.details.model";
import { ParametrosServiceService } from "../../parametros/_services/parametros.service.service";

@Injectable({
    providedIn: 'root'
  })
export class Huesped_Detail_Service{

    constructor (private http : HttpClient, private _parametrosService:ParametrosServiceService){}

    getDetails(){
        let queryParams = new HttpParams();
        queryParams = queryParams.append("hotel",this._parametrosService.getCurrentParametrosValue.hotel);

        return this.http.get<Huesped_Detail>(environment.apiUrl+"/details",{params:queryParams})
    }

    updateDetails(huesped:Huesped_Detail){
        return this.http.post(environment.apiUrl+"/reportes/details",huesped)
    }

    getDetailsById(folio:number){
        let queryParams = new HttpParams();
        queryParams = queryParams.append("hotel",this._parametrosService.getCurrentParametrosValue.hotel);

        return this.http.get<Huesped_Detail>(environment.apiUrl+"/details/"+folio,{params:queryParams})
    }

}