import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class DivisasService {

  constructor(
    public http:HttpClient
  ) { }

  getDivisas(){
    return this.http.get(environment.apiUrl+'/parametros/divisas')
  }
}
