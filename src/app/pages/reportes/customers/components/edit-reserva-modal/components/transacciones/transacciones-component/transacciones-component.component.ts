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
import { map, startWith } from 'rxjs/operators';
import { DetalleComponent } from '../helpers/detalle/detalle.component';
import { SuperUserComponent } from 'src/app/pages/reportes/customers/helpers/authorization/super.user/super.user.component';
import { MatPaginator } from '@angular/material/paginator';

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
  @ViewChild(MatPaginator) paginator: MatPaginator;

  
  folio:number
  /*Mensajes**/


  /*Listas*/
  codigosCargo:Codigos[]=[]
  codigosAbono:Codigos[]=[]
  estadoDeCuenta:edoCuenta[]=[]
  edoCuentaActivos:edoCuenta[]=[]
  edoCuentaCancelados:edoCuenta[]=[]
  edoCuentaDevoluciones:edoCuenta[]=[]
  edoCuentaCargos:edoCuenta[]=[]
  edoCuentaAbonos:edoCuenta[]=[]
  edoCuentaDescuentos:edoCuenta[]=[]

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
  nuevaSeleccion:string='Seleccione un Concepto'
  nuevosConceptos:boolean=false
  precioFijoChecked:boolean=false;
  porcentajeChecked:boolean=false;
  disabledFP:boolean=true;
  descuentoButton=true;
  totalCalculado:number=0;
  conceptosDisabled:boolean=true;
  closeResult: string;
  quantity:number=1;
  quantityNva:number=1;
  todosChecked:boolean=false;
  activosChecked:boolean=true;
  canceladosChecked:boolean=false;
  devolucionesChecked:boolean=false;
  abonosChecked:boolean=false;
  cargosChecked:boolean=false;
  descuentosChecked:boolean=false;
  fechaCancelado:Date;

  /**Forms */
  nuevosConceptosFormGroup:FormGroup;
  abonoFormGroup:FormGroup;
  formGroup:FormGroup;
  secondFormGroup:FormGroup;
  myControl = new FormControl();
  
  /**Loading  */
  isLoading:boolean=false
  isLoadingDesc:boolean=false
  submitted:boolean=false
  submittedAbono:boolean=false
  secondFormInvalid:boolean=false

  /**MAT TABLE */
  dataSource = new MatTableDataSource<edoCuenta>();
  displayedColumns:string[] = ['select','Fecha','Concepto','F.P.','_id','Valor','Fecha_Cancelado','Cantidad']
  
  /**Obseervables */
  formasDePago:string[]=['Efectivo','Tarjeta de Credito','Tarjeta de Debito']

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

    
  }

  
  loadForm(){

    this.formGroup= this.fb.group({
      concepto : ['',Validators.required],
      cantidad : ['',Validators.required],
      precio : ['',Validators.required],
    })

    this.nuevosConceptosFormGroup = this.fb.group({
      nuevoConcepto:['',Validators.required],
      nuevoPrecio:['',Validators.required],
      nuevaCantidad :[this.quantity,Validators.required]
    })

    this.abonoFormGroup= this.fb.group({
      conceptoManual : ['',Validators.required],
      cantidadAbono : ['',Validators.required],
      formaDePagoAbono : ['',Validators.required],
      notaAbono : [''],
    })

    this.secondFormGroup=this.fb.group({
      qtyPrecio:['',Validators.required],
      motivoDesc:['']
    },)
  }

  /**Useful Getter */
  get f() {return this.formGroup.controls}
  get abonosf() {return this.abonoFormGroup.controls}
  get second() {return this.secondFormGroup.controls}
  get nuevas() {return this.nuevosConceptosFormGroup.controls}




  getEdoCuenta(){
    
    // this.editService.getCurrentHuespedValue.folio
    this.edoCuentaService.getCuentas(this.customerService.getCurrentHuespedValue.folio).subscribe(
      (result:edoCuenta[])=>{
        
        this.estadoDeCuenta=[]
        this.edoCuentaActivos=[]
        this.edoCuentaCancelados=[]
        this.edoCuentaDevoluciones=[] 
        this.edoCuentaAbonos=[]
        this.edoCuentaCargos=[]
        this.edoCuentaDescuentos=[]


        for(let i=0;i<result.length;i++){

          if(result[i].Estatus=='Activo')
          { this.edoCuentaActivos.push(result[i]) }
          if(result[i].Estatus=='Cancelado')
          { this.edoCuentaCancelados.push(result[i]) }
          if(result[i].Estatus=='Devolucion')
          { this.edoCuentaDevoluciones.push(result[i]) }
          if(result[i].Cargo!=0)
          { this.edoCuentaCargos.push(result[i]) }
          if(result[i].Abono!=0)
          { this.edoCuentaAbonos.push(result[i]) }
          if(result[i].Forma_de_Pago=='Descuento')
          { this.edoCuentaDescuentos.push(result[i]) }
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
          if(result[i].Tipo=='C')
          {
            this.codigosCargo.push(result[i])
          }
          if(result[i].Tipo=='A')
          {
            this.codigosAbono.push(result[i])
          }
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
  nuevoConcepto(){
    if(this.nuevosConceptos==true)
    {
      this.nuevosConceptos=false
    }else if(this.nuevosConceptos==false)
    {
      this.nuevosConceptos=true;
    }
  }

  plusNin(qty:number)
  {
      this.quantity++;
      this.onChangeQty(this.quantity);
  }
  minusNin(qty:number)
  {
    if(this.quantity>0)
    {
    this.quantity--;
    }
    else if(this.quantity=0)
    {
      this.quantity=1;
    }
    else
    {
      this.quantity
    }
  
    this.onChangeQty(this.quantity);

  }

  plusNinNva(qty:number)
  {
      this.quantityNva++;
      this.onChangeQtyNva(this.quantityNva)
  }
  minusNinNva(qty:number)
  {
    if(this.quantityNva>0)
    {
    this.quantityNva--;
    }
    else if(this.quantityNva=0)
    {
      this.quantityNva=1;
    }
    else 
    {
      this.quantityNva
    }
  
    this.onChangeQtyNva(this.quantityNva)
  }


  selectedValue(value:Codigos){
    
this.nuevosConceptos=false
    this.codigoDeCargo={
      Descripcion:value.Descripcion,
      Tipo:value.Tipo,
      Precio : value.Precio
    }

    this.formGroup.controls['precio'].setValue(this.codigoDeCargo.Precio);
    this.formGroup.controls['cantidad'].setValue(1);
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

  onChangeQtyNva(qty:number)
  {

    if(qty<=0)
    {
      this.formGroup.controls['nuevaCantidad'].setValue(1);
      this.formGroup.controls['nuevoPrecio'].setValue(this.codigoDeCargo.Precio)
    
    }else
    {
      this.formGroup.controls['nuevoPrecio'].setValue((this.codigoDeCargo.Precio)*qty);
    }
        
  } 

  deleteRow(edo_cuenta:any){

    this.isLoading=true

    const modalRef = this.modalService.open(SuperUserComponent,{size:'sm'})
    modalRef.result.then((result) => {
      this.isLoading=false

      this.closeResult = `Closed with: ${result}`;
      }, (reason) => {
          this.closeResult = `Dismissed ${this.getDismissReason(reason)}`;

      });
    modalRef.componentInstance.passEntry.subscribe((receivedEntry) => {
      
          if(receivedEntry)
          {
            this.fechaCancelado=new Date()
            
                  if(edo_cuenta.Forma_De_Pago=='No Aplica')
                  {
                    edo_cuenta.Estatus='Devolucion'
                  }
                  else
                  {
                    edo_cuenta.Estatus='Cancelado'
                  }

                  this.edoCuentaService.updateRow(edo_cuenta._id,edo_cuenta.Estatus,this.fechaCancelado,receivedEntry.username).subscribe(
                    (value)=>{
                      this.isLoading=false

                      const modalRef = this.modalService.open(AlertsComponent, {size:'sm'});
                      modalRef.componentInstance.alertHeader = 'Exito'
                      modalRef.componentInstance.mensaje='Cargo Cancelado con Exito'   
                        setTimeout(() => {
                          modalRef.close('Close click');
                        },4000)
                        this.resetFiltros();

                        this.estadoDeCuenta=[]
                        this.getEdoCuenta();
                    },
                    (error)=>{
                      this.isLoading=false
                      if(error)
                      {
                        const modalRef = this.modalService.open(AlertsComponent, {size:'sm'});
                        modalRef.componentInstance.alertHeader = 'Error'
                        modalRef.componentInstance.mensaje='No se pudo actualizar el estatus el pago intente nuevamente'
                      
                          setTimeout(() => {
                            modalRef.close('Close click');
                          },4000)
                          this.resetFiltros();   
                        this.isLoading=false
                    }
                  }
                    )
          }else 
          {
            const modalRef2= this.modalService.open(AlertsComponent,{size:'md'})
            modalRef2.componentInstance.alertHeader='Error'
            modalRef2.componentInstance.mensaje='Usuario no autorizado para realizar descuentos'
            return
          }
      })


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

  selectedTable(event:any)
  {
    if(event.source.id=='todos')
    {
      if(event.source._checked==true)
      {
        this.dataSource.data = this.estadoDeCuenta

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

  onSubmit(){
    

    let pago:edoCuenta;

    if(this.nuevosConceptos)
    {
      if(this.nuevosConceptosFormGroup.invalid)
      {
        this.submitted=true
        return;
      }
      this.isLoading=true


        pago = {

        Folio:this.customerService.getCurrentHuespedValue.folio,
        Fecha:new Date(),
        Fecha_Cancelado:'',
        Referencia:'',
        Descripcion:this.nuevas.nuevoConcepto.value,
        Forma_de_Pago:'No Aplica',
        Cantidad:this.quantityNva,
        Cargo:this.nuevas.nuevoPrecio.value*this.quantityNva,
        Abono:0,
        Estatus:'Activo'
        }
    }else if(!this.nuevosConceptos)
    {
      if(this.formGroup.invalid)
        {
          this.submitted=true
          return;
        }

        this.isLoading=true

        pago = {

          Folio:this.customerService.getCurrentHuespedValue.folio,
          Fecha:new Date(),
          Fecha_Cancelado:'',
          Referencia:'',
          Descripcion:this.codigoDeCargo.Descripcion,
          Forma_de_Pago:'no Aplica',
          Cantidad:this.quantity,
          Cargo:this.f.precio.value*this.quantity,
          Abono:0,
          Estatus:'Activo'

          
  
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
            

        this.nuevosConceptosFormGroup.reset();
        this.formGroup.reset();
        this.resetFiltros();

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
          this.resetFiltros();

        }
      },
      ()=>{//FINALLY
      }
      )
  }

  onSubmitAbono(){
    
    if(this.abonoFormGroup.invalid)
    {
      this.submittedAbono=true
      return;
    }

    this.isLoading=true
    
    let pago:edoCuenta;

    
      pago = {

        Folio:this.customerService.getCurrentHuespedValue.folio,
        Fecha:new Date(),
        Fecha_Cancelado:'',
        Referencia:this.abonosf.notaAbono.value,
        Descripcion:this.abonosf.conceptoManual.value,
        Forma_de_Pago:this.abonosf.formaDePagoAbono.value,
        Cantidad:1,
        Cargo:0,
        Abono:this.abonosf.cantidadAbono.value,
        Estatus:'Activo'

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
            
          this.resetFiltros();

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
            this.resetFiltros();

          this.isLoading=false
      
        }
      },
      ()=>{//FINALLY
      }
      )
  }
  

  aplicaDescuento(autoriza:string){
    
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
        Fecha_Cancelado:'',
        Referencia:'',
        Descripcion:this.second.motivoDesc.value,
        Forma_de_Pago:'Descuento',
        Cantidad:1,
        Cargo:0,
        Abono:parseInt(this.second.qtyPrecio.value),
        Estatus:'Activo',
        Autorizo:autoriza

      }

      // totalConDescuento=totalConDescuento-(this.second.qtyPrecio.value ? null || undefined : 0)

    }
    if(this.porcentajeChecked==true)
    {
      descuento = {

        Folio:this.customerService.getCurrentHuespedValue.folio,
        Fecha:new Date(),
        Referencia:'',
        Descripcion:this.second.motivoDesc.value + ' ('+this.second.qtyPrecio.value+'%'+')',
        Forma_de_Pago:'Descuento',
        Cantidad:1,
        Cargo:0,
        Abono:((this.totalCalculado * (this.second.qtyPrecio.value) ) / 100),
        Estatus:'Activo',
        Autorizo:autoriza

      }

    }

    this.isLoading=true
    this.edoCuentaService.agregarPago(descuento).subscribe(
      ()=>{
        this.isLoading=false
        const modalRef = this.modalService.open(AlertsComponent, {size:'sm'});
        modalRef.componentInstance.alertHeader = 'Exito'
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
        this.descuentoButton=false
         this.estadoDeCuenta=[]
         this.getEdoCuenta();
          this.resetFiltros();
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
            this.resetFiltros();

          this.isLoadingDesc=false
          this.descuentoButton=false
        }
      },
      ()=>{//FINALLY
      }
      )

  }
  autoriza(){
    this.isLoading=true
    const modalRef = this.modalService.open(SuperUserComponent,{size:'sm'})
    modalRef.result.then((result) => {
      this.isLoading=false

      this.closeResult = `Closed with: ${result}`;
      }, (reason) => {
          this.closeResult = `Dismissed ${this.getDismissReason(reason)}`;
          this.estadoDeCuenta=[]
          this.getEdoCuenta();
          this.isLoading=false

          
      });
    modalRef.componentInstance.passEntry.subscribe((receivedEntry) => {
      this.isLoading=false

          if(receivedEntry)
          {
            this.aplicaDescuento(receivedEntry.username);
          }else 
          {
            const modalRef2= this.modalService.open(AlertsComponent,{size:'md'})
            modalRef2.componentInstance.alertHeader='Error'
            modalRef2.componentInstance.mensaje='Usuario no autorizado para realizar descuentos'
          }
      })
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
  abrirDetalle(row:any){

    const modalRef = this.modalService.open(DetalleComponent,{size:'md'})
    modalRef.componentInstance.row = row
    modalRef.componentInstance.folio = this.customerService.getCurrentHuespedValue.folio
    modalRef.componentInstance.fechaCancelado = row.Fecha_Cancelado.split('T')[0]


  }
  resetFiltros(){
    this.activosChecked=true;
    this.canceladosChecked=false;
    this.devolucionesChecked=false;
    this.todosChecked=false;
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

  isControlValidNuevo(controlName: string): boolean {
    const control = this.nuevosConceptosFormGroup.controls[controlName];
    return control.valid && (control.dirty || control.touched);
  }

  isControlInvalidNuevo(controlName: string): boolean {
    const control = this.nuevosConceptosFormGroup.controls[controlName];

    return control.invalid && (control.dirty || control.touched);
  }

  isControlValidAbono(controlName: string): boolean {
    const control = this.abonoFormGroup.controls[controlName];
    return control.valid && (control.dirty || control.touched);
  }

  isControlInvalidAbono(controlName: string): boolean {
    const control = this.abonoFormGroup.controls[controlName];

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
