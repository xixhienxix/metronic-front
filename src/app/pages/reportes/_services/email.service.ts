import { HttpClient, HttpParams } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { environment } from "src/environments/environment";
import { Huesped } from "../_models/customer.model";
import { ParametrosServiceService } from "../../parametros/_services/parametros.service.service";

@Injectable({ providedIn: 'root' })

export class EmailService {

    constructor(private http : HttpClient, private _parametrosService:ParametrosServiceService){}

    enviarConfirmacion(huesped:Huesped){
        
        const hotel = sessionStorage.getItem("HOTEL");
        let queryParams = new HttpParams();
        queryParams = queryParams.append("hotel",hotel);
        
        return this.http.post(environment.apiUrl+'/email/confirmacion',{huesped,params:queryParams})
    }
}