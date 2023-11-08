import { HttpClient, HttpParams } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { BehaviorSubject, Observable, Subject } from "rxjs";
import { map } from "rxjs/operators";
import { ITableState } from "src/app/_metronic/shared/crud-table";
import { environment } from "src/environments/environment";
import { edoCuenta } from "../_models/edoCuenta.model";
import { ParametrosServiceService } from "../../parametros/_services/parametros.service.service";

const EMPTY_EDO = {
  Folio:0,
  Referencia:'',
  Forma_de_Pago:'',
  Fecha:new Date(),
  Descripcion:'',
  Cantidad:1,
  Cargo:0,
  Abono:0,
}

@Injectable({ providedIn: 'root' })
export class Edo_Cuenta_Service {

    public edoCuentaSubject = new BehaviorSubject<edoCuenta[]>(null)
    private subject =new Subject<any>();

sendNotification(value:any)
{
    this.subject.next({text:value});
}

//this will be subscribed by the listing component which needs to display the //added/deleted ie updated list.

getNotification(){
    return this.subject.asObservable();
}

    get currentCuentaValue(): edoCuenta[] {
      return this.edoCuentaSubject.value;
    }
  
    set currentCuentaValue(user: edoCuenta[]) {
      this.edoCuentaSubject.next(user);
    }

    constructor(private http: HttpClient, private _parametrosService:ParametrosServiceService) { }

    agregarPago(pago:edoCuenta ){
      const hotel = sessionStorage.getItem("HOTEL");
      let queryParams = new HttpParams();
      queryParams = queryParams.append("hotel",hotel);

       return this.http.post<edoCuenta>(environment.apiUrl+'/edo_cuenta/pagos',{pago,params:queryParams}).pipe(
        map((data=>{
          this.sendNotification(true);
          }
      )));
    }

    updateRow(_id:string,estatus:string,fechaCancelado:Date,autorizo:string){
      const hotel = sessionStorage.getItem("HOTEL");
      let queryParams = new HttpParams();
      queryParams = queryParams.append("hotel",hotel);
      return this.http.put(environment.apiUrl+"/edo_cuenta/pagos",{_id,estatus,fechaCancelado,autorizo,params:queryParams}).pipe(
        map((data=>{
          this.sendNotification(true);
          }
      )));;
    }


    getCuentas(folio:number ){
      const hotel = sessionStorage.getItem("HOTEL");
      let queryParams = new HttpParams();
      queryParams = queryParams.append("hotel",hotel);

        return this.http.get<edoCuenta[]>(environment.apiUrl+'/edo_cuenta/cuenta/'+folio,{params:queryParams})
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
              this.currentCuentaValue = estadoDeCuenta
              
              return estadoDeCuenta    
          }))
        

    }

    getTodasLasCuentas(){
      const hotel = sessionStorage.getItem("HOTEL");
      let queryParams = new HttpParams();
      queryParams = queryParams.append("hotel",hotel);

      return this.http.get<edoCuenta[]>(environment.apiUrl+'/edo_cuenta/cuentas',{params:queryParams})
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

            return estadoDeCuenta    
        }))
      
  }

  actualizaSaldo(_id:string,monto:number){
    const hotel = sessionStorage.getItem("HOTEL");
    let queryParams = new HttpParams();
    queryParams = queryParams.append("hotel",hotel);

    return this.http.put<edoCuenta>(environment.apiUrl+'/edo_cuenta/alojamiento',{_id,monto,params:queryParams})
  }

}