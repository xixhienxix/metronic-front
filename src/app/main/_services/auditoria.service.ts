import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import {DateTime} from 'luxon'
import { ParametrosServiceService } from 'src/app/pages/parametros/_services/parametros.service.service';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AuditoriaService {

  constructor(
    private http:HttpClient,
    private parametrosService:ParametrosServiceService
    ) 
  {   }

    revisaNoShow(){
      this.http.get(environment.apiUrl+'/')
    }

}
