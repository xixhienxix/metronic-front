import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { BehaviorSubject, Observable } from "rxjs";
import { map } from "rxjs/operators";
import { ITableState } from "src/app/_metronic/shared/crud-table";
import { environment } from "src/environments/environment";
import { edoCuenta } from "../_models/edoCuenta.model";

@Injectable({ providedIn: 'root' })

export class Edo_Cuenta_Service {

    edoCuentaSubject:BehaviorSubject<edoCuenta[]>
    edoCuenta$:Observable<edoCuenta>

    get currentCuentaValue(): edoCuenta[] {
      return this.edoCuentaSubject.value;
    }
  
    set currentCuentaValue(user: edoCuenta[]) {
      this.edoCuentaSubject.next(user);
    }

    constructor(private http: HttpClient) { }

    agregarPago(pago:edoCuenta ){
       return this.http.post<edoCuenta>(environment.apiUrl+'/edo_cuenta/pagos',pago)
    }

    deleteRow(_id:string){
      return this.http.delete(environment.apiUrl+"/edo_cuenta/pagos/"+_id)
    }


    getCuentas(folio:number ){
        return this.http.get<edoCuenta[]>(environment.apiUrl+'/edo_cuenta/cuenta/'+folio)
        .pipe(
            map((datosCuenta)=>{
            let estadoDeCuenta:edoCuenta[]=[];
              for(var i in datosCuenta)
              {
                if(datosCuenta.hasOwnProperty(i))
                {
                    estadoDeCuenta.push(datosCuenta[i])
                }
              }
              this.edoCuentaSubject = new BehaviorSubject<edoCuenta[]>(estadoDeCuenta);

              return estadoDeCuenta    
          }))
        

    }

}