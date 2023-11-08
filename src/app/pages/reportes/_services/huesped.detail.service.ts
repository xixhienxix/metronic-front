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
        const hotel = sessionStorage.getItem("HOTEL");
        let queryParams = new HttpParams();
        queryParams = queryParams.append("hotel",hotel);

        return this.http.get<Huesped_Detail>(environment.apiUrl+"/details",{params:queryParams})
    }

    updateDetails(huesped:Huesped_Detail){
        const hotel = sessionStorage.getItem("HOTEL");
        let queryParams = new HttpParams();
        queryParams = queryParams.append("hotel",hotel);

        return this.http.post(environment.apiUrl+"/reportes/details",{huesped,params:queryParams})
    }

    getDetailsById(folio:number){
        const hotel = sessionStorage.getItem("HOTEL");
        let queryParams = new HttpParams();
        queryParams = queryParams.append("hotel",hotel);

        return this.http.get<Huesped_Detail>(environment.apiUrl+"/details/"+folio,{params:queryParams})
    }

}