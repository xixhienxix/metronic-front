import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { environment } from "src/environments/environment";
import { Huesped_Detail } from "../_models/huesped.details.model";

@Injectable({
    providedIn: 'root'
  })
export class Huesped_Detail_Service{

    constructor (private http : HttpClient){}

    getDetails(){
        return this.http.get<Huesped_Detail>(environment.apiUrl+"/details")
    }

    updateDetails(huesped:Huesped_Detail){
        return this.http.post(environment.apiUrl+"/reportes/details",huesped)
    }

    getDetailsById(folio:number){
        console.log(environment.apiUrl+"/details/"+folio)
        return this.http.get<Huesped_Detail>(environment.apiUrl+"/details/"+folio)
    }

}