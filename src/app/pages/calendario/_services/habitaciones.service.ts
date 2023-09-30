import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from 'src/environments/environment';
import { ParametrosServiceService } from '../../parametros/_services/parametros.service.service';

@Injectable({
  providedIn: 'root'
})
export class HabitacionesService {

  constructor(private http : HttpClient,
    private _parametrosService: ParametrosServiceService) { }

  getCodigosDeCuarto():Observable<string[]>{
    let queryParams = new HttpParams();
    queryParams = queryParams.append("hotel",this._parametrosService.getCurrentParametrosValue.hotel);
    
   return this.http.get<string[]>(environment.apiUrl + '/calendario/habitaciones',{params:queryParams})
   .pipe(
    map(responseData=>{
    return responseData
  })
  )
  }

}
