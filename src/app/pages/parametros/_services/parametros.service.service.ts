import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from 'src/environments/environment';
import { Parametros } from '../_models/parametros';
import { DivisasService } from './divisas.service';
const DEFAULT_PARAMS ={
  _id:'',
  iva:16,
  ish:3,
  auditoria:'',
  noShow:'',
  checkOut:'',
  zona:'',
  divisa:'',
  codigoZona:''
}
@Injectable({
  providedIn: 'root'
})
export class ParametrosServiceService {

  private currentParametros$=new BehaviorSubject<Parametros>(DEFAULT_PARAMS);

  constructor(public http:HttpClient,
    private divisaService:DivisasService) { }

  get getCurrentParametrosValue(): Parametros {
    return this.currentParametros$.value;
  }

  set setCurrentParametrosValue(huesped: Parametros) {
    this.currentParametros$.next(huesped);
  }


  getParametros(){
    return this.http.get<Parametros>(environment.apiUrl+'/parametros').pipe(map(
      (value)=>{
        const postArray = []
         for(const key in value)
         {
           if(value.hasOwnProperty(key))
           postArray.push(value[key]);
           this.setCurrentParametrosValue =postArray[0] 
           this.divisaService.getDivisasByParametro(postArray[0].divisa)       
          }
      }))
  }

  postParametros(parametros:Parametros){
    return this.http.post(environment.apiUrl+'/parametros',parametros)
  }

}
