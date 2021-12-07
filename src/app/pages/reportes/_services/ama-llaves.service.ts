import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { map } from 'rxjs/operators';
import {environment} from "../../../../environments/environment"
import { Ama_De_Llaves } from '../_models/ama-llaves';

const EMPTY_ESTAUTS = {
  _id:'',
  Descripcion:'SUCIA',
  Color:'',
}

@Injectable({
  providedIn: 'root'
})
export class AmaLlavesService {

  private currentEstatusAmaDeLlaves$=new BehaviorSubject<Ama_De_Llaves>(EMPTY_ESTAUTS);


  get getCurrentEstatusAmaDeLlaves(): Ama_De_Llaves {
    return this.currentEstatusAmaDeLlaves$.value;
  }

  set setCurrentEstatusAmaDeLlaves(ama: Ama_De_Llaves) {
    this.currentEstatusAmaDeLlaves$.next(ama);
  }
  constructor(
    public http : HttpClient
  ) { }

  getAmaDeLlaves(){
      return this.http.get<Ama_De_Llaves[]>(environment.apiUrl+'/reportes/ama_llaves')
      .pipe( map(responseData=>{
        console.log("MAP",responseData)
        return responseData
      })
      )}

  getAmaDeLlavesByID(cuarto:string,numero:number){
        return this.http.get<Ama_De_Llaves>(environment.apiUrl+'/reportes/ama_llaves/'+{cuarto,numero})
        .pipe( map(responseData=>{
          console.log("MAP",responseData)
          return responseData
        })
    )}

}



