import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import {DateTime} from 'luxon'
import { Observable, Subscription } from 'rxjs';
import { map } from 'rxjs/operators';
import { ParametrosServiceService } from 'src/app/pages/parametros/_services/parametros.service.service';
import { Huesped } from 'src/app/pages/reportes/_models/customer.model';
import { edoCuenta } from 'src/app/pages/reportes/_models/edoCuenta.model';
import { HuespedService } from 'src/app/pages/reportes/_services';
import { Edo_Cuenta_Service } from 'src/app/pages/reportes/_services/edo_cuenta.service';
import { EstatusService } from 'src/app/pages/reportes/_services/estatus.service';
import { HistoricoService } from 'src/app/pages/reportes/_services/historico.service';
import { environment } from 'src/environments/environment';
import { AlertsComponent } from '../alerts/alerts.component';

@Injectable({
  providedIn: 'root'
})
export class AuditoriaService {

  listaHuespedes:Huesped[]=[]
  listaEdoCuentas:edoCuenta[]=[]
  saldoAFavor:number
  result1$:Observable<any>
  totalAbonos:number=0;
  totalCargos:number=0;
  totalDescuentos:number=0;

  private subscriptions: Subscription[] = [];

  constructor(
    private http:HttpClient,
    private parametrosService:ParametrosServiceService,
    private estatusService:EstatusService,
    private customerservice:HuespedService,
    private edoCuentaService:Edo_Cuenta_Service,
    private historicoService : HistoricoService,
    private customerService: HuespedService,
    private modal:NgbModal

    ) 
  {   }
  
   // SIgue probando

   procesaAuditoria(){

    const result$ = this.getHuespedes();


   result$.pipe(map(values => {
      for (let i = 0; i < values.length; i++) {
        this.edoCuentaService.getCuentas(values[i].folio).subscribe(
          (estadoDeCuenta) => {
            if (estadoDeCuenta) {
              this.totalAbonos=0;
              this.totalCargos=0;
              this.totalDescuentos=0;
              for (let x = 0; x < estadoDeCuenta.length; x++) {

                if(estadoDeCuenta[x].Cargo!=0 && estadoDeCuenta[x].Estatus=='Activo')
                { 
                  this.totalCargos+=estadoDeCuenta[x].Cargo
                } 
                if(estadoDeCuenta[x].Forma_de_Pago=='Descuento' && estadoDeCuenta[x].Estatus=='Activo')
                { 
                  this.totalDescuentos+=estadoDeCuenta[x].Abono
                }
                if(estadoDeCuenta[x].Abono!=0 && estadoDeCuenta[x].Estatus=='Activo' && estadoDeCuenta[x].Forma_de_Pago!='Descuento')
                { 
                  this.totalAbonos+=estadoDeCuenta[x].Abono 
                }
              }

              if (this.totalAbonos <= 0) {
                this.revisaNoShow(values[i]);
              }
              if((this.totalCargos-(this.totalAbonos+this.totalDescuentos))==0){
                this.revisaCheckOut(values[i]);
              }
              this.revisaCanceladas(values[i]);
            }
          },
          (error) => {});
      }
    })).subscribe(
      (value) => {
        
      },
      (error) => {
        console.log(error);
      })

    }

   getHuespedes()
    {
       return this.http.get<Huesped[]>(environment.apiUrl+'/reportes/huesped')  
    }

    // getEdoCuentas(){

    //   return this.edoCuentaService.getTodasLasCuentas()
    // }

   revisaNoShow(huesped:Huesped){
    if(huesped.estatus=='Reserva Sin Pago' || huesped.estatus=='Esperando Deposito')
    {
      huesped.estatus='No Show'

      let diaLlegada = huesped.llegada.split('/')[0]
      let mesLlegada = huesped.llegada.split('/')[1]
      let anoLlegada = huesped.llegada.split('/')[2]

      let horaNoshow = this.parametrosService.getCurrentParametrosValue.noShow.split(':')[0]
      let minutosNoShow = this.parametrosService.getCurrentParametrosValue.noShow.split(':')[1]

      let fechaLlegada = DateTime.local().set({day:diaLlegada,month:mesLlegada,year:anoLlegada})
      let fechaDelDia = DateTime.local().setZone(this.parametrosService.getCurrentParametrosValue.zona)
      let horaNoShow = DateTime.local().setZone(this.parametrosService.getCurrentParametrosValue.zona).set({hour:horaNoshow,minutes:minutosNoShow})
      
       if(fechaLlegada.ts<=horaNoShow.ts){

       const sb = this.estatusService.actualizaEstatus(11,huesped.folio,huesped).subscribe(
          (value)=>{
            console.log(value)

            this.postHistorico(huesped)
            this.customerservice.fetch()
          },
          (error)=>{
            console.log(error)
          }
          )
          this.subscriptions.push(sb);

       }
    }
         

     }
     revisaCheckOut(huesped:Huesped){

      if(huesped.estatus=='Huesped en Casa')
      {
        huesped.estatus='Check-Out'

        let diaSalida = huesped.salida.split('/')[0]
        let mesSalida = huesped.salida.split('/')[1]
        let anoSalida = huesped.salida.split('/')[2]
  
        let horaCheckOut = this.parametrosService.getCurrentParametrosValue.checkOut.split(':')[0]
        let minutosCheckOut = this.parametrosService.getCurrentParametrosValue.checkOut.split(':')[1]
  
        let fechaSalida = DateTime.local().set({day:diaSalida,month:mesSalida,year:anoSalida})
        let fechahoraCheckOut = DateTime.local().setZone(this.parametrosService.getCurrentParametrosValue.zona).set({hour:horaCheckOut,minutes:minutosCheckOut})
        
         if(fechaSalida.ts<=fechahoraCheckOut.ts){
  
         this.estatusService.actualizaEstatus(4,huesped.folio,huesped).subscribe(
            (value)=>{
              this.postHistorico(huesped)

              console.log(value)
              this.customerservice.fetch()
            },
            (error)=>{
              console.log(error)
            }
            )
  
         }
      }
      
}


  revisaCanceladas(huesped:Huesped){
    if(huesped.estatus=='Huesped en Casa')
    {
      huesped.estatus='Reserva Cancelada'
      this.estatusService.actualizaEstatus(12,huesped.folio,huesped).subscribe(
          (value)=>{
            this.postHistorico(huesped)

            console.log(value)
            this.customerservice.fetch()
          },
          (error)=>{
            console.log(error)
          }
          )
    }
    
  }

  postHistorico(huesped:Huesped){
    const sb = this.historicoService.addPost(huesped).subscribe(
      (value)=>{
        console.log(value)
        this.customerService.fetch();

        const sb = this.customerService.deleteHuesped(huesped._id).subscribe(
          (value)=>{
            
          },
          (error)=>{})
          this.subscriptions.push(sb)
      },
      (error)=>{
        if(error){
          const modalRef=this.modal.open(AlertsComponent,{ size: 'sm', backdrop:'static' })
          modalRef.componentInstance.alertHeader='ERROR'
          modalRef.componentInstance.mensaje = 'Ocurrio un Error al momento de Guardar al huesped en el historico'
          setTimeout(() => {
            modalRef.close('Close click');
          },4000)
        }
      }
      )

  this.subscriptions.push(sb);
  }

  }
