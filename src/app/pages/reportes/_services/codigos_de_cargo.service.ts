import { HttpClient, HttpParams } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { environment } from "src/environments/environment";
import { ParametrosServiceService } from "../../parametros/_services/parametros.service.service";

@Injectable({ providedIn: 'root' })

export class CodigosDeCargoService {
    constructor(private http:HttpClient,
        private _parametrosService:ParametrosServiceService){}

    getCodigosDeCargo(){
        const hotel = sessionStorage.getItem("HOTEL");
        let queryParams = new HttpParams();
        queryParams = queryParams.append("hotel",hotel);
        
        return this.http.get(environment.apiUrl+'/codigos',{params:queryParams})
    }
}

