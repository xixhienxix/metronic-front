import { Injectable, OnDestroy, Inject, Component } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import {Adicional}from '../_models/adicional.model';
import { environment } from 'src/environments/environment';
import { map } from 'rxjs/operators';
@Injectable({
  providedIn: 'root'
})
export class AdicionalService  {

    getAdicionales(){
        return this.http.get<Adicional[]>(environment.apiUrl+"/adicionales")
        .pipe(
          map(responseData=>{
  
            console.log("MAP",responseData)
            return responseData
          })
        )
    }
    
  constructor(private http: HttpClient) { }
}