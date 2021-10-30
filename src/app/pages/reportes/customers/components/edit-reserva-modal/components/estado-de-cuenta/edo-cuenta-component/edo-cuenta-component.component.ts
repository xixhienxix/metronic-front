import { Component, OnInit } from '@angular/core';
import { ModalDismissReasons, NgbActiveModal, NgbDatepickerI18n, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { edoCuenta } from 'src/app/pages/reportes/_models/edoCuenta.model';
import { HuespedService } from 'src/app/pages/reportes/_services';
import { Edo_Cuenta_Service } from 'src/app/pages/reportes/_services/edo_cuenta.service';
import { AlertsComponent } from '../../../../helpers/alerts-component/alerts/alerts.component';

@Component({
  selector: 'app-edo-cuenta-component',
  templateUrl: './edo-cuenta-component.component.html',
  styleUrls: ['./edo-cuenta-component.component.scss']
})
export class EdoCuentaComponentComponent implements OnInit {

  /**Models */
  alojamientoPorNoche:any[]=[]
  estadoDeCuenta:edoCuenta[]=[]
  edoCuentaActivos:edoCuenta[]=[]
  edoCuentaCancelados:edoCuenta[]=[]
  edoCuentaDevoluciones:edoCuenta[]=[]
  edoCuentaAlojamientosActivos:any[]=[]

  closeResult: string;
  subTotalAlojamiento:number;
  totalCalculado:number

  constructor(
    public customerService:HuespedService,
    public estadoDeCuentaService:Edo_Cuenta_Service,
    public modalService:NgbModal,
    public i18n: NgbDatepickerI18n,

  ) { }

  ngOnInit(): void {
    this.customerService.getCurrentHuespedValue.habitacion
    this.estadoDeCuentaService.currentCuentaValue
    this.getEdoCuenta()
  }


  getEdoCuenta(){
    this.estadoDeCuentaService.getCuentas(this.customerService.getCurrentHuespedValue.folio).subscribe(
      (result:edoCuenta[])=>{
        
        this.estadoDeCuenta=[]
        this.edoCuentaActivos=[]
        this.edoCuentaCancelados=[]
        this.edoCuentaDevoluciones=[]

        for(let i=0;i<result.length;i++){

          if(result[i].Estatus=='Activo')
          { 
            let fechaIncial : Date 
            let edoCuentaAlojamientoTemp

            if(result[i].Descripcion=='Alojamiento')
            {
              let toDate = new Date()
              let fromDate

              const anoLlegada = parseInt(result[i].Fecha.toString().split("T").toString().split('-')[0])
              const mesLlegada = parseInt(result[i].Fecha.toString().split("T").toString().split('-')[1])
              const diaLlegada = parseInt(result[i].Fecha.toString().split("T").toString().split('-')[2])
              fromDate = new Date(anoLlegada,mesLlegada-1,diaLlegada)


              toDate.setDate(fromDate.getDate() + this.customerService.getCurrentHuespedValue.noches);
              
              for  (fromDate; fromDate <= toDate; fromDate.setDate(fromDate.getDate()+1))
              {
                let fullFechaSalida=new Date(fromDate).getDate()+" de "+this.i18n.getMonthFullName(new Date(fromDate).getMonth()+1)+" del "+new Date(fromDate).getFullYear()
                // // fechaIncial.toLocaleString('es-MX')
                // const anoLlegada = parseInt(result[i].Fecha.toString().split("T").toString().split('-')[0])
                // const mesLlegada = parseInt(result[i].Fecha.toString().split("T").toString().split('-')[1])
                // const diaLlegada = parseInt(result[i].Fecha.toString().split("T").toString().split('-')[2])
                // fechaIncial = new Date(anoLlegada,mesLlegada-1,diaLlegada)

                edoCuentaAlojamientoTemp = {

                  _id:result[i]._id,
                  Folio:result[i].Folio,
                  Referencia:result[i].Referencia,
                  Forma_de_Pago:result[i].Forma_de_Pago,
                  Fecha:fullFechaSalida,
                  Fecha_Cancelado:result[i].Fecha_Cancelado,
                  Descripcion:result[i].Descripcion,
                  Cantidad:result[i].Cantidad,
                  Cargo:result[i].Cargo/this.customerService.getCurrentHuespedValue.noches,
                  Abono:result[i].Abono,
                  Total:result[i].Total,
                  Estatus:result[i].Estatus,
                  Autorizo:result[i].Autorizo
                }

                this.edoCuentaAlojamientosActivos.push(edoCuentaAlojamientoTemp)

                // fechaIncial.setDate(fechaIncial.getDate() + 1);
                this.subTotalAlojamiento = result[i].Total
              }
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

      },
      (err)=>
      {
        if (err)
        {

            const modalRef = this.modalService.open(AlertsComponent, {size:'sm'});
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
  }

    /*Modal HELPERS*/

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
}
