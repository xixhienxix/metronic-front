import { Component, EventEmitter, OnInit, Output, ViewChild } from '@angular/core';
import { ModalDismissReasons, NgbActiveModal, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { edoCuenta } from 'src/app/pages/reportes/_models/edoCuenta.model';
import { Edo_Cuenta_Service } from 'src/app/pages/reportes/_services/edo_cuenta.service';
import { EditReservaModalComponent } from '../../edit-reserva-modal/edit-reserva-modal.component';
import { AlertsComponent } from '../alerts-component/alerts/alerts.component';
import {MatTableDataSource} from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { Huesped } from 'src/app/pages/reportes/_models/customer.model';
import { Observable } from 'rxjs';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

export interface Transacciones {
  Fecha: Date;
  Descripcion: string;
  Forma_De_Pago: string;
  Cantidad: number;
  Cargo:number;
  Abono:number
}

@Component({
  selector: 'app-ajustes',
  templateUrl: './ajustes.component.html',
  styleUrls: ['./ajustes.component.scss']
})
export class AjustesComponent implements OnInit {
  displayedColumns: string[] = ['Fecha', 'Descripcion','Forma_De_Pago','Cantidad','Cargo','Abono'];

  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;
  @Output() passEntry: EventEmitter<any> = new EventEmitter();

  /**OBSERVABLE */
  // edoCuenta$:Observable<edoCuenta[]>

  closeResult:string;
  alertHeader:string;
  totalCalculado:number=0

  /*MODELS*/
  estadoDeCuenta:edoCuenta[]=[];
  transacciones:Transacciones[]=[]
  ajustes:Transacciones[]=[]
  huesped:Huesped;
  formasDePago:string[]=['Ajuste','Efectivo']

  /*Table*/
  clickedRows = new Set<Transacciones>();
  dataSource: MatTableDataSource<Transacciones>;

  /*AjustesTable*/
  ajustesDataSource: MatTableDataSource<Transacciones>;

  /*FORM*/
  formGroup:FormGroup

  /*LOADINGS*/
  submitted:boolean=false
  isLoading:boolean=false


  constructor(
    
    private edoCuentaService:Edo_Cuenta_Service,
    private modalService : NgbModal,
    private fb : FormBuilder,
    private modal : NgbActiveModal,
    ) { 

      // this.edoCuentaService.edoCuentaSubject.subscribe(
      //   (result)=>
      //   {
      //     for(let i =0;i<result.length;i++){
      //       this.transacciones[i] = {
      //         Fecha:result[i].Fecha,
      //         Descripcion:result[i].Descripcion,
      //         Forma_De_Pago:result[i].Forma_de_Pago,
      //         Cantidad:result[i].Cantidad,
      //         Cargo:result[i].Cargo,
      //         Abono:result[i].Abono,
      //       }
      //     }

      //     this.estadoDeCuenta=result
      //     this.dataSource = new MatTableDataSource(this.transacciones);
      //   },
      //   (err)=>{
      //     if (err)
      //     {
      //       const modalRef = this.modalService.open(AlertsComponent,{size:'sm'})
      //       modalRef.componentInstance.mensaje='No se Pudo Cargar la Tabla'
      //       modalRef.componentInstance.alertHeader='Error'
      //       modalRef.result.then((result) => {
      //         this.closeResult = `Closed with: ${result}`;
      //         }, (reason) => {
      //             this.closeResult = `Dismissed ${this.getDismissReason(reason)}`;
      //         });
      //         setTimeout(() => {
      //           modalRef.close('Close click');
      //         },4000)
      //     }
      //   }
      //   )
    }

  ngOnInit(): void {
    this.initForm();
    this.creaTabla();
  }

  ngAfterViewInit() {

    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  creaTabla(){

    this.edoCuentaService.getCuentas(this.huesped.folio).subscribe(
      (result)=>{
        
        for(let i =0;i<result.length;i++){
          this.transacciones[i] = {
            Fecha:result[i].Fecha,
            Descripcion:result[i].Descripcion,
            Forma_De_Pago:result[i].Forma_de_Pago,
            Cantidad:result[i].Cantidad,
            Cargo:result[i].Cargo,
            Abono:result[i].Abono,
          }
        }
        this.edoCuentaService.edoCuentaSubject.next(result)
        this.estadoDeCuenta=result
        this.dataSource = new MatTableDataSource(this.transacciones);   
      },
      (err)=>{
        if (err)
        {
          const modalRef = this.modalService.open(AlertsComponent,{size:'sm'})
          modalRef.componentInstance.mensaje='No se Pudo Cargar la Tabla'
          modalRef.componentInstance.alertHeader='Error'
          modalRef.result.then((result) => {
            this.closeResult = `Closed with: ${result}`;
            }, (reason) => {
                this.closeResult = `Dismissed ${this.getDismissReason(reason)}`;
            });
            setTimeout(() => {
              modalRef.close('Close click');
            },4000)
        }
      }
    )
  }

  initForm(){
    this.formGroup = this.fb.group({
      monto:['',Validators.required],
      pago:['',Validators.required],
      descripcion:['',Validators.required],
      tipo:['',Validators.required]
    })
  }

  get f() {return this.formGroup.controls}

  getTotal(){
    let abonos = this.estadoDeCuenta.map(t => t.Abono).reduce((acc, value) => acc + value, 0);
    let cargos = this.estadoDeCuenta.map(t => t.Cargo).reduce((acc, value) => acc + value, 0);
    return cargos-abonos
  }

  getTotalAjustes(){
    let abonos = this.ajustes.map(t => t.Abono).reduce((acc, value) => acc + value, 0);
    let cargos = this.ajustes.map(t => t.Cargo).reduce((acc, value) => acc + value, 0);
    return cargos-abonos
  }
  

  llenarAjustesTable(value:Transacciones){


    if(this.ajustes.length==0)
    {
      this.ajustes.push(value)
    }else
    {
      this.ajustes=[]
      this.ajustes.push(value)
    }
    this.ajustesDataSource = new MatTableDataSource(this.ajustes);

  }

onSubmit()
{
  if(this.formGroup.invalid)
    {
      this.submitted=true
      return;
    }

    this.isLoading=true
    
    let pago:edoCuenta;

    if(this.f.tipo.value=='Ajuste')
    {
       pago = {

        Folio:this.huesped.folio,
        Fecha:new Date(),
        Referencia:'',
        Descripcion:this.f.descripcion.value,
        Forma_de_Pago:this.f.pago.value,
        Cantidad:1,
        Abono:this.f.monto.value,
        Cargo:0
        
      }
    }else if(this.f.tipo.value=='Devolucion')
    {
      pago = {

        Folio:this.huesped.folio,
        Fecha:new Date(),
        Referencia:'',
        Descripcion:this.f.descripcion.value,
        Forma_de_Pago:this.f.pago.value,
        Cantidad:1,
        Abono:0,
        Cargo:this.f.monto.value
      }
    }

    

    this.edoCuentaService.agregarPago(pago).subscribe(
      (result)=>{
        
        const modalRef = this.modalService.open(AlertsComponent, {size:'sm'})
        modalRef.componentInstance.alertHeader='Exito'
        modalRef.componentInstance.mensaje=this.f.tipo.value +' guardado con exito!'        
        modalRef.result.then((result) => {
          this.closeResult = `Closed with: ${result}`;
          }, (reason) => {
              this.closeResult = `Dismissed ${this.getDismissReason(reason)}`;
          });
          setTimeout(() => {
            modalRef.close('Close click');
          },4000)

          this.isLoading=false
          this.formGroup.reset();
          this.ajustes=[]
          this.estadoDeCuenta=[]
          this.transacciones=[]

          this.creaTabla();


      },
      (err)=>
      {
        if(err)
        {
          const modalRef = this.modalService.open(AlertsComponent, {size:'sm'});
          modalRef.componentInstance.alertHeader='Error'
          modalRef.componentInstance.mensaje='No se pudo Guardar el Pago Intente Nuevamente'
          modalRef.result.then((result) => {
            this.closeResult = `Closed with: ${result}`;
            }, (reason) => {
                this.closeResult = `Dismissed ${this.getDismissReason(reason)}`;
            });
            setTimeout(() => {
              modalRef.close('Close click');
            },4000)
              
          this.isLoading=false
      
        }
      },
      ()=>{//FINALLY
      }
      )
  }
 
  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();

    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
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


  
  closeModal(){
      this.modal.close();
  }
  /*FORM HELPERS*/
  isControlValid(controlName: string): boolean {
    const control = this.formGroup.controls[controlName];
    return control.valid && (control.dirty || control.touched);
  }

  isControlInvalid(controlName: string): boolean {
    const control = this.formGroup.controls[controlName];

    return control.invalid && (control.dirty || control.touched);
  }
}
