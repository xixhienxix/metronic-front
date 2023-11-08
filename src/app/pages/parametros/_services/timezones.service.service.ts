import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { ParametrosServiceService } from './parametros.service.service';

@Injectable({
  providedIn: 'root'
})
export class TimezonesService {


  constructor(private http : HttpClient,private _parametrosService:ParametrosServiceService) { }

  getTimeZones(){

   return this.http.get(environment.apiUrl+'/parametros/timezones')
  }
}
