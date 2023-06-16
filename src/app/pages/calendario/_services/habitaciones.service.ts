import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class HabitacionesService {

  constructor(private http : HttpClient) { }

  getCodigosDeCuarto():Observable<string[]>{
   return this.http.get<string[]>(environment.apiUrl + '/calendario/habitaciones')
   .pipe(
    map(responseData=>{
    return responseData
  })
  )
  }

}
