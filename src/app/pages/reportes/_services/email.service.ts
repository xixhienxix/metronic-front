import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { environment } from "src/environments/environment";
import { Huesped } from "../_models/customer.model";

@Injectable({ providedIn: 'root' })

export class EmailService {

    constructor(private http : HttpClient){}

    enviarConfirmacion(huesped:Huesped){
        return this.http.post(environment.apiUrl+'/email/confirmacion',huesped)
    }
}