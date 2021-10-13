import { ThisReceiver } from '@angular/compiler';
import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { ModalDismissReasons, NgbActiveModal,NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { Codigos } from 'src/app/pages/reportes/_models/codigos.model';
import { edoCuenta } from 'src/app/pages/reportes/_models/edoCuenta.model';
import { CodigosDeCargoService } from 'src/app/pages/reportes/_services/codigos_de_cargo.service';
import { Edo_Cuenta_Service } from 'src/app/pages/reportes/_services/edo_cuenta.service';
import { PaginatorState } from 'src/app/_metronic/shared/crud-table';
import { EditReservaModalComponent } from '../../../edit-reserva-modal.component';
import { HuespedService } from 'src/app/pages/reportes/_services';
import { AjustesComponent } from '../../../../helpers/ajustes-huesped/ajustes.component';
import { BehaviorSubject, Observable, Subject, Subscription } from 'rxjs';
import { Huesped } from 'src/app/pages/reportes/_models/customer.model';
import { AlertsComponent } from '../../../../helpers/alerts-component/alerts/alerts.component';
import { MatTableDataSource } from '@angular/material/table';

const EMPTY_CUSTOMER: Huesped = {
  id:undefined,
  folio:undefined,
  adultos:1,
  ninos:1,
  nombre: '',
  estatus:'',
  // llegada: date.getDay().toString()+'/'+date.getMonth()+'/'+date.getFullYear(),
  // salida: (date.getDay()+1).toString()+'/'+date.getMonth()+'/'+date.getFullYear(),
  llegada:'',
  salida:'',
  noches: 1,
  tarifa:500,
  porPagar: 500,
  pendiente:500,
  origen: 'Online',
  habitacion: "",
  telefono:"",
  email:"",
  motivo:"",
  //OTROS DATOs
  fechaNacimiento:'',
  trabajaEn:'',
  tipoDeID:'',
  numeroDeID:'',
  direccion:'',
  pais:'',
  ciudad:'',
  codigoPostal:'',
  lenguaje:'Español',
  numeroCuarto:0,
  creada:'',
  tipoHuesped:"Regular"
};

@Component({
  selector: 'app-transacciones-component',
  templateUrl: './transacciones-component.component.html',
  styleUrls: ['./transacciones-component.component.scss']
})

export class TransaccionesComponentComponent implements OnInit {

  
  folio:number
  /*Mensajes**/


  /*Listas*/
  codigos:Codigos[]=[]
  estadoDeCuenta:edoCuenta[]=[]

  codigoDeCargo:Codigos={
    Descripcion:'',
    Tipo:'',
    Precio : 0
  }
  /**Subscription */
  subscription:Subscription
  /*Models*/
  huesped:Huesped
  /*Site Helpers*/
  precioFijoChecked:boolean=false;
  porcentajeChecked:boolean=false;
  disabledFP:boolean=true;
  descuentoButton=true;
  totalCalculado:number=0;
  conceptosDisabled:boolean=true;
  closeResult: string;

  /*PAGINATOR*/
  paginator: PaginatorState;

  /**Forms */
  formGroup:FormGroup;
  secondFormGroup:FormGroup;
  
  /**Loading  */
  isLoading:boolean=false
  isLoadingDesc:boolean=false
  submitted:boolean=false
  secondFormInvalid:boolean=false

  /**MAT TABLE */
  dataSource = new MatTableDataSource<edoCuenta>();
  displayedColumns:string[] = ['select','Fecha','Concepto','F.P.','Valor']
  
  formasDePago:string[]=['Servicio','Efectivo','Tarjeta de Credito','Tarjeta de Debito']

  constructor(
    private fb : FormBuilder,
    private edoCuentaService:Edo_Cuenta_Service,
    private codigosService:CodigosDeCargoService,
    private modalService: NgbModal,
    private customerService:HuespedService

    ) {
      this.subscription=this.edoCuentaService.getNotification().subscribe(data=>{
        if(data)
        {
          this.getEdoCuenta();
        }
      });
     }

  ngOnInit(): void {
    this.loadForm();
    this.getCodigosDeCargo();
    this.getEdoCuenta();
    this.paginator = this.customerService.paginator;

  }

  
  loadForm(){

    this.formGroup= this.fb.group({
      concepto : ['',Validators.required],
      pago : ['',Validators.required],
      idDeposito : [''],
      cantidad : ['',Validators.required],
      precio : ['',Validators.required],
      cargo_abono : ['',Validators.required]
    })

    this.secondFormGroup=this.fb.group({
      qtyPrecio:['',Validators.required],
    },)
  }

  /**Useful Getter */
  get f() {return this.formGroup.controls}
  get second() {return this.secondFormGroup.controls}




  getEdoCuenta(){
    
    // this.editService.getCurrentHuespedValue.folio
    this.edoCuentaService.getCuentas(this.customerService.getCurrentHuespedValue.folio).subscribe(
      (result:edoCuenta[])=>{
        

          this.dataSource.data = result
          this.estadoDeCuenta = result

          let totalCargos=0;
          let totalAbonos=0;

          for(let i=0;i<this.estadoDeCuenta.length;i++)
          {
            totalCargos = totalCargos + this.estadoDeCuenta[i].Cargo
            totalAbonos = totalAbonos + this.estadoDeCuenta[i].Abono
          }

          this.totalCalculado=totalCargos-totalAbonos

          this.huesped = this.customerService.getCurrentHuespedValue
          this.huesped.pendiente = this.totalCalculado
          this.huesped.porPagar = totalCargos

          this.customerService.setCurrentHuespedValue=this.huesped
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

  getCodigosDeCargo(){
    this.codigosService.getCodigosDeCargo().subscribe(
      (result:Codigos[])=>{
        for(let i=0;i<result.length;i++)
        {
          this.codigos.push(result[i])
        }
      },
      (err)=>{
        if (err)
        {
          if(err.statusText='Not Found')
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
        }
      },

    );
  }
  
  filtroCodigosDeCargo(event:any){
    this.conceptosDisabled=false
    this.codigos=[]

    if(this.f.cargo_abono.value=='Cargo')
    {
      this.formasDePago=['Servicio','Efectivo','Tarjeta de Credito','Tarjeta de Debito']
      this.formGroup.patchValue({pago:'Servicio'})
      this.disabledFP=true
    }
    else
    {
      this.formasDePago=['Efectivo','Tarjeta de Credito','Tarjeta de Debito']
      this.formGroup.patchValue({pago:''})
      this.disabledFP=false
    }

    this.codigosService.getCodigosDeCargo().subscribe(
      (result:Codigos[])=>{
        for(let i=0;i<result.length;i++)
        {
          if(this.f.cargo_abono.value=='Cargo')
          {
            if(result[i].Tipo=='C')
            {this.codigos.push(result[i])}
          }
          else if(this.f.cargo_abono.value=='Abono')
          {
            if(result[i].Tipo=='A')
            {this.codigos.push(result[i])}
          }
        }
      },
      (err)=>{
        if (err)
        {


            const modalRef = this.modalService.open(AlertsComponent, {size:'sm'});
            modalRef.componentInstance.alertHeader = 'Error'
            modalRef.componentInstance.mensaje='No hay codigos de cargo disponibles, vuelva a abrir la ventana'
            
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

    );
  }

  selectedValue(value:Codigos){
    

    this.codigoDeCargo={
      Descripcion:value.Descripcion,
      Tipo:value.Tipo,
      Precio : value.Precio
    }

    this.formGroup.controls['precio'].setValue(this.codigoDeCargo.Precio);
    this.formGroup.controls['cantidad'].setValue(1);
    this.formGroup.controls['idDeposito'].setValue('');
  }

  onChangeQty(qty:number)
  {

    if(qty<=0)
    {


      this.formGroup.controls['cantidad'].setValue(1);
      this.formGroup.controls['precio'].setValue(this.codigoDeCargo.Precio)
    
    }else
    {
     
        this.formGroup.controls['precio'].setValue((this.codigoDeCargo.Precio)*qty);
    }
        

  }  

  deleteRow(edo_cuenta:any){
    this.isLoading=true


    this.edoCuentaService.deleteRow(edo_cuenta._id).subscribe(
      (value)=>{
        this.isLoading=false

        const modalRef = this.modalService.open(AlertsComponent, {size:'sm'});
        modalRef.componentInstance.alertHeader = 'Exito'
        modalRef.componentInstance.mensaje='Cargo Borrado con Exito'   
          setTimeout(() => {
            modalRef.close('Close click');
          },4000)

          this.estadoDeCuenta=[]
          this.getEdoCuenta();
      },
      (error)=>{
        this.isLoading=false
        if(error)
        {
          const modalRef = this.modalService.open(AlertsComponent, {size:'sm'});
          modalRef.componentInstance.alertHeader = 'Error'
          modalRef.componentInstance.mensaje='No se pudo guardar el pago intente nuevamente'
        
            setTimeout(() => {
              modalRef.close('Close click');
            },4000)
              
          this.isLoading=false
      }
    }
      )
  }

  selectedRadioButton(event:any)
  {
    if(event.source.id=='precioFijo')
    {
      if(event.source._checked==true)
      {
        this.descuentoButton=false;
        this.precioFijoChecked=true
        this.porcentajeChecked=false;
      }
      else if (event.source._checked==false)
      {
        this.descuentoButton=true;
        this.precioFijoChecked=false
      }
    }
    else if(event.source.id=='porcentaje')
    {
      if(event.source._checked==true)
      {
        this.descuentoButton=false
        this.porcentajeChecked=true
        this.precioFijoChecked=false;
      }      
      else if (event.source._checked==false)
      {
        this.descuentoButton=true
        this.porcentajeChecked=false;
      }
    }
  }

  onSubmit(){
    
    if(this.formGroup.invalid)
    {
      this.submitted=true
      return;
    }

    this.isLoading=true
    
    let pago:edoCuenta;

    if(this.codigoDeCargo.Tipo=='C')
    {
       pago = {

        Folio:this.customerService.getCurrentHuespedValue.folio,
        Fecha:new Date(),
        Referencia:this.f.idDeposito.value,
        Descripcion:this.codigoDeCargo.Descripcion,
        Forma_de_Pago:this.f.pago.value,
        Cantidad:this.f.cantidad.value,
        Cargo:this.f.precio.value,
        Abono:0
        
      }
    }else if(this.codigoDeCargo.Tipo=='A')
    {
      pago = {

        Folio:this.customerService.getCurrentHuespedValue.folio,
        Fecha:new Date(),
        Referencia:this.f.idDeposito.value,
        Descripcion:this.codigoDeCargo.Descripcion,
        Forma_de_Pago:this.f.pago.value,
        Cantidad:this.f.cantidad.value,
        Cargo:0,
        Abono:this.f.precio.value,
      }
    }

    
this.isLoading=true
    this.edoCuentaService.agregarPago(pago).subscribe(
      ()=>{
        this.isLoading=false
        const modalRef = this.modalService.open(AlertsComponent, {size:'sm'});
        modalRef.componentInstance.alertHeader = 'Exito'
        modalRef.componentInstance.mensaje='Movimiento agregado al Estado de Cuenta del Húesped'
        
          setTimeout(() => {
            modalRef.close('Close click');
          },4000)
            

        this.formGroup.reset();
        this.estadoDeCuenta=[]
        this.getEdoCuenta();
        
      },
      (err)=>
      {
        this.isLoading=false
        if(err)
        {
          const modalRef = this.modalService.open(AlertsComponent, {size:'sm'});
          modalRef.componentInstance.alertHeader = 'Error'
          modalRef.componentInstance.mensaje=err.message
        
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

  aplicaDescuento(){
    


    if(this.secondFormGroup.invalid)
    {
      this.secondFormInvalid=true
      return;
    }else{this.secondFormGroup.valid}{this.secondFormInvalid=false}


    this.descuentoButton=true
    this.isLoadingDesc=true

    let descuento:edoCuenta

    if(this.precioFijoChecked==true) 
    { 
      descuento = {

        Folio:this.customerService.getCurrentHuespedValue.folio,
        Fecha:new Date(),
        Referencia:'',
        Descripcion:'Descuento Aplicado',
        Forma_de_Pago:'Descuento',
        Cantidad:1,
        Cargo:0,
        Abono:parseInt(this.second.qtyPrecio.value),
      }

      // totalConDescuento=totalConDescuento-(this.second.qtyPrecio.value ? null || undefined : 0)

    }
    if(this.porcentajeChecked==true)
    {
      descuento = {

        Folio:this.customerService.getCurrentHuespedValue.folio,
        Fecha:new Date(),
        Referencia:'',
        Descripcion:'Descuento Aplicado',
        Forma_de_Pago:'Descuento',
        Cantidad:1,
        Cargo:0,
        Abono:((this.totalCalculado * (this.second.qtyPrecio.value) ) / 100),
      }

    }

    this.isLoading=true
    this.edoCuentaService.agregarPago(descuento).subscribe(
      ()=>{
        this.isLoading=false
        const modalRef = this.modalService.open(AlertsComponent, {size:'sm'});
        modalRef.componentInstance.alertHeader = 'Error'
        modalRef.componentInstance.mensaje='Descuento Aplicado sobre el total de la cuenta'
        modalRef.result.then((result) => {
          this.closeResult = `Closed with: ${result}`;
          }, (reason) => {
              this.closeResult = `Dismissed ${this.getDismissReason(reason)}`;
          });
          setTimeout(() => {
            modalRef.close('Close click');
          },4000)
            

        this.isLoadingDesc=false
        this.secondFormGroup.reset();

         this.estadoDeCuenta=[]
         this.getEdoCuenta(); 
      },
      (err)=>
      {
        this.isLoading=false
        if(err)
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
              
          this.isLoadingDesc=false
        }
      },
      ()=>{//FINALLY
      }
      )

  }
  /*MODALS*/
  ajustes(){
    const modalRef = this.modalService.open(AjustesComponent,{size:'lg'})
    modalRef.componentInstance.huesped = this.customerService.getCurrentHuespedValue
    modalRef.componentInstance.estadoDeCuenta=this.estadoDeCuenta
    modalRef.result.then((result) => {
      this.closeResult = `Closed with: ${result}`;
      }, (reason) => {
          this.closeResult = `Dismissed ${this.getDismissReason(reason)}`;
          this.estadoDeCuenta=[]
          this.getEdoCuenta();
          
      });
      
  }
  
  /*form Helpers*/
  atLeatOneValidator(validator: ValidatorFn, controls:string[] = null) 
   {
    let group:FormGroup

    if(!controls){
      controls = Object.keys(group.controls)
    }

    const hasAtLeastOne = group && group.controls && controls
      .some(k => !validator(group.controls[k]));

    return hasAtLeastOne ? null : {
      atLeastOne: true,
    };
  };

  isControlValid(controlName: string): boolean {
    const control = this.formGroup.controls[controlName];
    return control.valid && (control.dirty || control.touched);
  }

  isControlInvalid(controlName: string): boolean {
    const control = this.formGroup.controls[controlName];

    return control.invalid && (control.dirty || control.touched);
  }
  isSecondControlValid(controlName: string): boolean {
    const control = this.secondFormGroup.controls[controlName];
    return control.valid && (control.dirty || control.touched);
  }

  isSecondControlInvalid(controlName: string): boolean {
    const control = this.secondFormGroup.controls[controlName];
    return control.invalid && (control.dirty || control.touched);
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
