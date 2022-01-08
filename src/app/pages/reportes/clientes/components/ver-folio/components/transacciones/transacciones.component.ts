import { Component, OnInit } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { ModalDismissReasons, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { Subscription } from 'rxjs';
import { AlertsComponent } from 'src/app/main/alerts/alerts.component';
import { DivisasService } from 'src/app/pages/parametros/_services/divisas.service';
import { DetalleComponent } from 'src/app/pages/reportes/customers/components/edit-reserva-modal/components/transacciones/helpers/detalle/detalle.component';
import { edoCuenta } from 'src/app/pages/reportes/_models/edoCuenta.model';
import { Historico } from 'src/app/pages/reportes/_models/historico.model';
import { Edo_Cuenta_Service } from 'src/app/pages/reportes/_services/edo_cuenta.service';
import { HistoricoService } from 'src/app/pages/reportes/_services/historico.service';

@Component({
  selector: 'app-transacciones',
  templateUrl: './transacciones.component.html',
  styleUrls: ['./transacciones.component.scss']
})
export class TransaccionesComponent implements OnInit {

  cliente:Historico
  /*Listas*/
  estadoDeCuenta:edoCuenta[]=[]
  edoCuentaActivos:edoCuenta[]=[]
  edoCuentaCancelados:edoCuenta[]=[]
  edoCuentaDevoluciones:edoCuenta[]=[]
  edoCuentaCargos:edoCuenta[]=[]
  edoCuentaAbonos:edoCuenta[]=[]
  edoCuentaDescuentos:edoCuenta[]=[]

  /**MAT TABLE */
  dataSource = new MatTableDataSource<edoCuenta>();
  displayedColumns:string[] = ['Fecha','Concepto','F.P.','_id','Valor','Fecha_Cancelado','Cantidad']

  descuentoButton=true;
  totalCalculado:number=0;
  totalVigente:number=0;
  totalActivos:number=0;
  totalDescuentos:number=0;
  totalCargos:number=0;
  totalAbonos:number=0;
  totalCancelados:number=0;
  todosChecked:boolean=false;
  activosChecked:boolean=true;
  canceladosChecked:boolean=false;
  devolucionesChecked:boolean=false;
  abonosChecked:boolean=false;
  cargosChecked:boolean=false;
  descuentosChecked:boolean=false;
  closeResult: string;


  /**Subscription */
  subscription:Subscription[]=[]

  constructor(
    public divisasService:DivisasService,
    public modalService:NgbModal,
    public historicoService:HistoricoService,
    public edoCuentaService:Edo_Cuenta_Service
  ) { }

  ngOnInit(): void {
    this.cliente=this.historicoService.getCurrentClienteValue
    this.getEdoCuenta();
  }

  getEdoCuenta(){
    
    // this.editService.getCurrentHuespedValue.folio
   const sb = this.edoCuentaService.getCuentas(this.historicoService.getCurrentClienteValue.folio).subscribe(
      (result:edoCuenta[])=>{
        
        this.estadoDeCuenta=[]
        this.edoCuentaActivos=[]
        this.edoCuentaCancelados=[]
        this.edoCuentaDevoluciones=[] 
        this.edoCuentaAbonos=[]
        this.edoCuentaCargos=[]
        this.edoCuentaDescuentos=[]
        this.totalAbonos=0;
        this.totalActivos=0;
        this.totalCargos=0;
        this.totalDescuentos=0;
        this.totalCancelados=0;

        for(let i=0;i<result.length;i++){

          if(result[i].Estatus=='Activo')
          { 
            this.edoCuentaActivos.push(result[i]) 
            this.totalActivos+=(result[i].Cargo-result[i].Abono)
          }
          if(result[i].Estatus=='Cancelado')
          { 
            this.edoCuentaCancelados.push(result[i]) 
            this.totalCancelados+=(result[i].Cargo-result[i].Abono)
          }
          if(result[i].Estatus=='Devolucion')
          { 
            this.edoCuentaDevoluciones.push(result[i]) 
          }
          if(result[i].Cargo!=0 && result[i].Estatus=='Activo')
          { 
            this.edoCuentaCargos.push(result[i]) 
            this.totalCargos+=result[i].Cargo
          }
          if(result[i].Abono!=0 && result[i].Estatus=='Activo' && result[i].Forma_de_Pago!='Descuento')
          { 
            this.edoCuentaAbonos.push(result[i])
            this.totalAbonos+=result[i].Abono 
          }
          if(result[i].Forma_de_Pago=='Descuento' && result[i].Estatus=='Activo')
          { 
            this.edoCuentaDescuentos.push(result[i]) 
            this.totalDescuentos+=result[i].Abono
          }
          this.estadoDeCuenta.push(result[i]) 

        }

          this.dataSource.data = this.edoCuentaActivos
          // this.dataSource.paginator = this.paginator;

          let totalCargos=0;
          let totalAbonos=0;

          for(let i=0;i<this.edoCuentaActivos.length;i++)
          {
      
              totalCargos = totalCargos + this.edoCuentaActivos[i].Cargo
              totalAbonos = totalAbonos + this.edoCuentaActivos[i].Abono
            
          }

          this.totalCalculado=totalCargos-totalAbonos
          this.totalVigente=this.totalCalculado
      
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

  selectedTable(event:any)
  {
    if(event.source.id=='todos')
    {
      if(event.source._checked==true)
      {

        this.dataSource.data = this.estadoDeCuenta
        this.totalCalculado=this.totalVigente

        this.todosChecked=true
        this.activosChecked=false;
        this.canceladosChecked=false;
        this.devolucionesChecked=false;
        this.cargosChecked=false;
        this.abonosChecked=false;
        this.descuentosChecked=false;

      }
      else if (event.source._checked==false)
      {
        this.canceladosChecked=false
        this.activosChecked=false
        this.todosChecked=false
        this.devolucionesChecked=false;
        this.cargosChecked=false;
        this.abonosChecked=false;
        this.descuentosChecked=false;
      }
    }
    else if(event.source.id=='cancelados')
    {
      if(event.source._checked==true)
      {
        this.dataSource.data =this.edoCuentaCancelados
        this.totalCalculado=this.totalCancelados

        this.canceladosChecked=true
        this.activosChecked=false;
        this.todosChecked=false;
        this.devolucionesChecked=false;
        this.cargosChecked=false;
        this.abonosChecked=false;
        this.descuentosChecked=false;
      }
      else if (event.source._checked==false)
      {
        this.canceladosChecked=false
        this.activosChecked=false
        this.todosChecked=false
        this.devolucionesChecked=false;
        this.cargosChecked=false;
        this.abonosChecked=false;
        this.descuentosChecked=false;
      }
    }
    else if(event.source.id=='activos')
    {
      if(event.source._checked==true)
      {
        this.dataSource.data = this.edoCuentaActivos
        this.totalCalculado=this.totalActivos

        this.activosChecked=true
        this.canceladosChecked=false;
        this.todosChecked=false;
        this.devolucionesChecked=false;
        this.cargosChecked=false;
        this.abonosChecked=false;
        this.descuentosChecked=false;
      }
      else if (event.source._checked==false)
      {
        
        this.canceladosChecked=false
        this.activosChecked=false
        this.todosChecked=false
        this.devolucionesChecked=false;
        this.cargosChecked=false;
        this.abonosChecked=false;
        this.descuentosChecked=false;
      }
    }
    else if(event.source.id=='devoluciones')
    {
      if(event.source._checked==true)
      {
        this.dataSource.data = this.edoCuentaDevoluciones


        this.activosChecked=false
        this.canceladosChecked=false;
        this.todosChecked=false;
        this.devolucionesChecked=true;
        this.cargosChecked=false;
        this.abonosChecked=false;
        this.descuentosChecked=false;
      }
      else if (event.source._checked==false)
      {
        this.canceladosChecked=false
        this.activosChecked=false
        this.todosChecked=false
        this.devolucionesChecked=false;
        this.cargosChecked=false;
        this.abonosChecked=false;
        this.descuentosChecked=false;

      }
    }
    else if(event.source.id=='descuentosRadio')
    {
      if(event.source._checked==true)
      {
        this.dataSource.data = this.edoCuentaDescuentos
        this.totalCalculado=this.totalDescuentos

        this.activosChecked=false
        this.canceladosChecked=false;
        this.todosChecked=false;
        this.devolucionesChecked=false;
        this.cargosChecked=false;
        this.abonosChecked=false;
        this.descuentosChecked=true;
      }
      else if (event.source._checked==false)
      {
        this.canceladosChecked=false
        this.activosChecked=false
        this.todosChecked=false
        this.devolucionesChecked=false;
        this.cargosChecked=false;
        this.abonosChecked=false;
        this.descuentosChecked=false;

      }
    }
    else if(event.source.id=='abonosRadio')
    {
      if(event.source._checked==true)
      {
        this.dataSource.data = this.edoCuentaAbonos
        this.totalCalculado=this.totalAbonos

        this.activosChecked=false
        this.canceladosChecked=false;
        this.todosChecked=false;
        this.devolucionesChecked=false;
        this.cargosChecked=false;
        this.abonosChecked=true;
        this.descuentosChecked=false;
      }
      else if (event.source._checked==false)
      {
        this.canceladosChecked=false
        this.activosChecked=false
        this.todosChecked=false
        this.devolucionesChecked=false;
        this.cargosChecked=false;
        this.abonosChecked=false;
        this.descuentosChecked=false;

      }
    }
    else if(event.source.id=='cargosRadio')
    {
      if(event.source._checked==true)
      {
        this.dataSource.data = this.edoCuentaCargos
        this.totalCalculado=this.totalCargos

        this.activosChecked=false
        this.canceladosChecked=false;
        this.todosChecked=false;
        this.devolucionesChecked=false;
        this.cargosChecked=true;
        this.abonosChecked=false;
        this.descuentosChecked=false;
      }
      else if (event.source._checked==false)
      {
        this.canceladosChecked=false
        this.activosChecked=false
        this.todosChecked=false
        this.devolucionesChecked=false;
        this.cargosChecked=false;
        this.abonosChecked=false;
        this.descuentosChecked=false;

      }
    }
  }

  abrirDetalle(row:any){

    const modalRef = this.modalService.open(DetalleComponent,{ size: 'md', backdrop:'static' })
    modalRef.componentInstance.row = row
    modalRef.componentInstance.folio = this.cliente.folio
    modalRef.componentInstance.fechaCancelado = row.Fecha_Cancelado.split('T')[0]


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
}
