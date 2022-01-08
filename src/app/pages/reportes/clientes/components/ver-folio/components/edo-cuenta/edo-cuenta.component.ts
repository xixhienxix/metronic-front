import { Component, OnInit } from '@angular/core';
import { ModalDismissReasons, NgbDatepickerI18n, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { Subscription } from 'rxjs';
import { AlertsComponent } from 'src/app/main/alerts/alerts.component';
import { DivisasService } from 'src/app/pages/parametros/_services/divisas.service';
import { edoCuenta } from 'src/app/pages/reportes/_models/edoCuenta.model';
import { Historico } from 'src/app/pages/reportes/_models/historico.model';
import { HuespedService } from 'src/app/pages/reportes/_services';
import { Edo_Cuenta_Service } from 'src/app/pages/reportes/_services/edo_cuenta.service';
import { HistoricoService } from 'src/app/pages/reportes/_services/historico.service';

@Component({
  selector: 'app-edo-cuenta',
  templateUrl: './edo-cuenta.component.html',
  styleUrls: ['./edo-cuenta.component.scss']
})
export class EdoCuentaComponent implements OnInit {
  /**Subscription */
  subscription:Subscription[]=[]
  /**Models */
  alojamientoPorNoche:any[]=[]
  estadoDeCuenta:edoCuenta[]=[]
  edoCuentaActivos:edoCuenta[]=[]
  edoCuentaCancelados:edoCuenta[]=[]
  edoCuentaDevoluciones:edoCuenta[]=[]
  edoCuentaAlojamientosActivos:any[]=[]
  edoCuentaServiciosExtra:any[]=[]
  edoCuentaDescuentosLista:any[]=[]
  edoCuentaAbonosLista:any[]=[]

  closeResult: string;
  subTotalAlojamiento:string;
  totalCalculado:number
  subTotalServiciosExtra:number=0;
  impuestoSobreHospedaje:number=0;
  iva:number=0;
  totalimpuestos:number=0;
  totalDescuentos:number=0;
  totalAbonos:number=0;
  totalCargos:number=0;
  
  cliente:Historico

  constructor(
    public estadoDeCuentaService:Edo_Cuenta_Service,
    public modalService:NgbModal,
    public i18n: NgbDatepickerI18n,
    public divisasService:DivisasService,
    public historicoService:HistoricoService
    
  ) { 
    this.cliente = this.historicoService.getCurrentClienteValue
  }
  
  ngOnInit(): void {
    this.estadoDeCuentaService.currentCuentaValue
    this.getEdoCuenta()

  }


  getEdoCuenta(){


    const sb = this.estadoDeCuentaService.getCuentas(this.cliente.folio).subscribe(
      (result:edoCuenta[])=>{
        this.totalCargos=0;
        this.totalDescuentos=0;
        this.totalAbonos=0;
        this.subTotalServiciosExtra=0;
        this.iva=0;
        this.estadoDeCuenta=[]
        this.edoCuentaActivos=[]
        this.edoCuentaCancelados=[]
        this.edoCuentaDevoluciones=[]
        this.alojamientoPorNoche=[]

        this.edoCuentaAlojamientosActivos=[]
        this.edoCuentaServiciosExtra=[]
        this.edoCuentaDescuentosLista=[]
        this.edoCuentaAbonosLista=[]

        for(let i=0;i<result.length;i++){

          //Totales
          if(result[i].Cargo!=0 && result[i].Estatus=='Activo')
          { 
            this.totalCargos+=result[i].Cargo
          } 
          if(result[i].Forma_de_Pago=='Descuento' && result[i].Estatus=='Activo')
          { 
            this.totalDescuentos+=result[i].Abono
          }
          if(result[i].Abono!=0 && result[i].Estatus=='Activo' && result[i].Forma_de_Pago!='Descuento')
          { 
            this.totalAbonos+=result[i].Abono 
          }
          //

          if(result[i].Estatus=='Activo')
          { 
            let edoCuentaAlojamientoTemp

            let fromDate

            var anoLlegada = parseInt(this.cliente.llegada.split("/")[2])
            var mesLlegada = parseInt(this.cliente.llegada.split("/")[1])
            var diaLlegada = parseInt(this.cliente.llegada.split("/")[0])

            fromDate = new Date(anoLlegada,mesLlegada-1,diaLlegada)

            if(result[i].Descripcion=='Alojamiento')
            {
              
               
               fromDate = new Date(anoLlegada,mesLlegada-1,diaLlegada)

              for (let y=0; y<this.cliente.noches; y++)
              {

                let fullFechaSalida=new Date(fromDate).getUTCDate()+" de "+this.i18n.getMonthFullName(new Date(fromDate).getUTCMonth()+1)+" del "+new Date(fromDate).getFullYear()

                edoCuentaAlojamientoTemp = {

                  _id:result[i]._id,
                  Folio:result[i].Folio,
                  Referencia:result[i].Referencia,
                  Forma_de_Pago:result[i].Forma_de_Pago,
                  Fecha:fullFechaSalida,
                  Fecha_Cancelado:result[i].Fecha_Cancelado,
                  Descripcion:result[i].Descripcion,
                  Cantidad:result[i].Cantidad,
                  Cargo:result[i].Cargo/this.cliente.noches,
                  Abono:result[i].Abono,
                  Total:result[i].Total,
                  Estatus:result[i].Estatus,
                  Autorizo:result[i].Autorizo
                }

                this.impuestoSobreHospedaje = result[i].Total*3/100
                this.edoCuentaAlojamientosActivos.push(edoCuentaAlojamientoTemp)

                // fechaIncial.setDate(fechaIncial.getDate() + 1);
                this.subTotalAlojamiento = result[i].Cargo.toLocaleString()

                fromDate.setDate(fromDate.getDate() + 1);
              }
            }

            if(result[i].Descripcion!='Alojamiento'&& result[i].Cargo!=0)
            {
             
              let fechaLarga = new Date(anoLlegada,mesLlegada-1,diaLlegada)

              let fullFechaServicio=new Date(fechaLarga).getUTCDate()+" de "+this.i18n.getMonthFullName(new Date(fechaLarga).getUTCMonth()+1)+" del "+new Date(fechaLarga).getFullYear()


              let edoCuentaserviciosExtraTemp = {

                _id:result[i]._id,
                Folio:result[i].Folio,
                Referencia:result[i].Referencia,
                Forma_de_Pago:result[i].Forma_de_Pago,
                Fecha:fullFechaServicio,
                Fecha_Cancelado:result[i].Fecha_Cancelado,
                Descripcion:result[i].Descripcion,
                Cantidad:result[i].Cantidad,
                Cargo:result[i].Cargo,
                Abono:result[i].Abono,
                Total:result[i].Total,
                Estatus:result[i].Estatus,
                Autorizo:result[i].Autorizo
              }

              this.edoCuentaServiciosExtra.push(edoCuentaserviciosExtraTemp)
              this.subTotalServiciosExtra += result[i].Cargo
            }
            if(result[i].Forma_de_Pago=='Descuento')
            {
            
              let fechaLargaDesc = new Date(anoLlegada,mesLlegada-1,diaLlegada)

              let fullFechaDescuento=new Date(fechaLargaDesc).getUTCDate()+" de "+this.i18n.getMonthFullName(new Date(fechaLargaDesc).getUTCMonth()+1)+" del "+new Date(fechaLargaDesc).getFullYear()

              let edoCuentaDescuentos = {

                _id:result[i]._id,
                Folio:result[i].Folio,
                Referencia:result[i].Referencia,
                Forma_de_Pago:result[i].Forma_de_Pago,
                Fecha:fullFechaDescuento,
                Fecha_Cancelado:result[i].Fecha_Cancelado,
                Descripcion:result[i].Descripcion,
                Cantidad:result[i].Cantidad,
                Cargo:result[i].Cargo,
                Abono:result[i].Abono,
                Total:result[i].Total,
                Estatus:result[i].Estatus,
                Autorizo:result[i].Autorizo
              }

              this.edoCuentaDescuentosLista.push(edoCuentaDescuentos)


              
            }

            if(result[i].Abono!=0 && result[i].Forma_de_Pago!='Descuento')
            {
              let fechaLargaAbonos = new Date(anoLlegada,mesLlegada-1,diaLlegada)

              let fullFechaAbonos=new Date(fechaLargaAbonos).getUTCDate()+" de "+this.i18n.getMonthFullName(new Date(fechaLargaAbonos).getUTCMonth()+1)+" del "+new Date(fechaLargaAbonos).getFullYear()

              let edoCuentaAbonos = {

                _id:result[i]._id,
                Folio:result[i].Folio,
                Referencia:result[i].Referencia,
                Forma_de_Pago:result[i].Forma_de_Pago,
                Fecha:fullFechaAbonos,
                Fecha_Cancelado:result[i].Fecha_Cancelado,
                Descripcion:result[i].Descripcion,
                Cantidad:result[i].Cantidad,
                Cargo:result[i].Cargo,
                Abono:result[i].Abono,
                Total:result[i].Total,
                Estatus:result[i].Estatus,
                Autorizo:result[i].Autorizo
              }

              this.edoCuentaAbonosLista.push(edoCuentaAbonos)
              // this.totalAbonos+=result[i].Abono

            }

            this.edoCuentaActivos.push(result[i]) 
   
          }


          if(result[i].Estatus=='Cancelado')
          { this.edoCuentaCancelados.push(result[i]) }
          if(result[i].Estatus=='Devolucion')
          { this.edoCuentaDevoluciones.push(result[i]) }
          this.estadoDeCuenta.push(result[i]) 

        }

        

          let totalCargos=0;
          let totalAbonos=0;

          for(let i=0;i<this.edoCuentaActivos.length;i++)
          {
      
              totalCargos = totalCargos + this.edoCuentaActivos[i].Cargo
              totalAbonos = totalAbonos + this.edoCuentaActivos[i].Abono
            
          }

          this.totalCalculado=totalCargos-totalAbonos

          this.iva = this.subTotalServiciosExtra*16/100
          this.totalimpuestos=this.iva+(this.impuestoSobreHospedaje)

      },
      (err)=>
      {
        if (err)
        {

            const modalRef = this.modalService.open(AlertsComponent, { size: 'sm', backdrop:'static' });
            modalRef.componentInstance.alertHeader = 'Error'
            modalRef.componentInstance.mensaje=err.message

            modalRef.result.then((result) => {
              this.closeResult = `Closed with: ${result}`;
              }, (reason) => {
                  this.closeResult = `Dismissed ${this.getDismissReason(reason)}`;
              });
              setTimeout(() => {
                modalRef.close('Close click');
              },4000)
                
          
        }
      },
      ()=>{}
      )
      this.subscription.push(sb)
  }
  getDismissReason(reason: any): string 
  {
        if (reason === ModalDismissReasons.ESC) {
            return 'by pressing ESC';
        } else if (reason === ModalDismissReasons.BACKDROP_CLICK) {
            return 'by clicking on a backdrop';
        } else {
            return  `with: ${reason}`;
        }
  }

  ngOnDestroy(): void {
    this.subscription.forEach(sb=>sb.unsubscribe())
  }
}
