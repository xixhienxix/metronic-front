import { Component, OnInit, Output, ViewChild, EventEmitter } from '@angular/core';
import { Form, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { ModalDismissReasons, NgbCalendar, NgbDate, NgbDatepickerI18n, NgbDateStruct, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { Subscription } from 'rxjs';
import { Adicional } from 'src/app/pages/reportes/_models/adicional.model';
import { Huesped } from 'src/app/pages/reportes/_models/customer.model';
import { edoCuenta } from 'src/app/pages/reportes/_models/edoCuenta.model';
import { Estatus } from 'src/app/pages/reportes/_models/estatus.model';
import { Promesa } from 'src/app/pages/reportes/_models/promesa.model';
import { HuespedService } from 'src/app/pages/reportes/_services';
import { AdicionalService } from 'src/app/pages/reportes/_services/adicional.service';
import { Edo_Cuenta_Service } from 'src/app/pages/reportes/_services/edo_cuenta.service';
import { PromesaService } from 'src/app/pages/reportes/_services/promesa.service';
import { AlertsComponent } from '../../../../../../../../main/alerts/alerts.component';
import {DateTime} from 'luxon'
import { ParametrosServiceService } from 'src/app/pages/parametros/_services/parametros.service.service';



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
  tarifa:'Tarifa Estandar',
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
  numeroCuarto:'0',
  creada:'',
  tipoHuesped:"Regular"
};
@Component({
  selector: 'app-reservas-component',
  templateUrl: './reservas-component.component.html',
  styleUrls: ['./reservas-component.component.scss']
})
export class ReservasComponentComponent implements OnInit {
  /*PaginATION*/
  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;
  @ViewChild('pregunta') preguntaPrevia: null;

  @Output() next = new EventEmitter();
  
  /**INDEX */
  idPromesa:''

/**FORMS */
  formGroup:FormGroup
  formGroupPromesa:FormGroup
  serviciosAdicionaledForm:FormGroup
  thirdForm:FormGroup
  forthForm:FormGroup

  /*Date Variables*/
  fullFechaSalida:string
  fullFechaLlegada:string
  fromDate: DateTime | null;
  toDate: DateTime | null;
  comparadorInicial:DateTime
  comparadorFinal:DateTime
  fechaFinalBloqueo:string=''
  fechaInicialBloqueo:string
  noches:number;
  closeResult:string;
  minDate:NgbDateStruct;
  today:DateTime

  /*Models*/
  huesped: Huesped = EMPTY_CUSTOMER;
  adicionalArray:Adicional[]=[];
  estatusArray:Estatus[]=[];
  promesasPagoList:any[]=[];
  formasDePago:string[]=['Efectivo','Tarjeta de Credito','Tarjeta de Debito']
  private subscriptions: Subscription[] = [];
  clickedRow = new Set<any>()
  clickedRows = new Set<any>();
  model:NgbDateStruct;

  subscription:Subscription[]=[]

  /*TABLE*/
  displayedColumns: string[] = ['select','_id','Fecha', 'Cantidad', 'Estatus','Accion','Color','ColorAplicado'];
  dataSource: MatTableDataSource<Promesa>;

  /*Diseño Dinamico*/
  changeStyleHidden:string = 'display:none'
  setLabel:string="label label-lg label-light-primary label-inline"
  promesasDisplay:boolean=false;
  expired:boolean=false;
  isLoading:boolean=false;
  todayString:string;
  pagoManual:boolean=false;
  formadePago:string='Efectivo';
  inputDisabled:boolean=false

  constructor(
    public i18n: NgbDatepickerI18n,
    private adicionalService : AdicionalService,
    private calendar: NgbCalendar,
    public customerService : HuespedService,
    public fb : FormBuilder,
    public modalService: NgbModal,
    public promesaService : PromesaService,
    public edoCuentaService:Edo_Cuenta_Service,
    public _parametrosService:ParametrosServiceService
  ) {  
    this.today = DateTime.now().setZone(this._parametrosService.getCurrentParametrosValue.zona)

    this.todayString = this.today.month+"/"+this.today.day+"/"+this.today.year

    this.fromDate = DateTime.now().setZone(this._parametrosService.getCurrentParametrosValue.zona)
    // this.toDate = calendar.getNext(calendar.getToday(), 'd', 1); 
    this.toDate=this.today.plus({days:1})
    this.minDate=DateTime.now().setZone(this._parametrosService.getCurrentParametrosValue.zona)

     this.fechaFinalBloqueo=this.toDate.day+" de "+this.i18n.getMonthFullName(this.toDate.month)+" del "+this.toDate.year 

  }

  ngOnInit(): void {

    if(this.customerService.getCurrentHuespedValue.estatus=='Reserva Cancelada'||this.customerService.getCurrentHuespedValue.estatus=='No Show'||this.customerService.getCurrentHuespedValue.estatus=='Check-Out')
    {this.inputDisabled=true}

    this.getAdicionales();
    const sb = this.customerService.huespedUpdate$.subscribe((value)=>{
      this.huesped=value
      this.huesped.llegada.split('-')[0]
      
      this.fullFechaLlegada = this.huesped.llegada.split('/')[0]+" de "+this.i18n.getMonthFullName(+this.huesped.llegada.split('/')[1])+" del "+this.huesped.llegada.split('/')[2] 
      this.fullFechaSalida=this.huesped.salida.split('/')[0]+" de "+this.i18n.getMonthFullName(+this.huesped.salida.split('/')[1])+" del "+this.huesped.salida.split('/')[2] 

      this.getPromesa();
      // this.formatFechas();
      this.loadForm();
    })
    this.subscription.push(sb)

  }

  // ngAfterViewInit() {

  // }

    eliminarPromesa(_id:any){
      this.isLoading=true
     const sb = this.promesaService.borrarPromesa(_id).subscribe(
        (result)=>{
          this.isLoading=false
          const modalRef = this.modalService.open(AlertsComponent,{ size: 'sm', backdrop:'static' })
          modalRef.componentInstance.mensaje='Promesa Borrada con Exito'
          modalRef.componentInstance.alertHeader='Exito'
            setTimeout(() => {
              modalRef.close('Close click');
            },4000)

            this.promesasPagoList=[]
            this.getPromesa()
        },
        (error)=>
        {
          this.isLoading=false

                if (error)
                            {
                              const modalRef = this.modalService.open(AlertsComponent,{ size: 'sm', backdrop:'static' })
                              modalRef.componentInstance.mensaje='No se Pudo Cargar la Tabla'
                              modalRef.componentInstance.alertHeader='Error'
                                setTimeout(() => {
                                  modalRef.close('Close click');
                                },4000)
                            }
        }
        )
        this.subscription.push(sb)
    }

    getPromesa()
    {
   const sb = this.promesaService.getPromesas(this.huesped.folio).subscribe(
                          (result)=>{
                            let today = DateTime.now().setZone(this._parametrosService.getCurrentParametrosValue.zona)

                            for(let i =0;i<result.length;i++){
                              
                              let color =''
                              let colorAplicado='' //amarillo
                              let expirado 
                           
                              
                              let todayMillis = today.toMillis()

                              var dateParts50 = result[i].Fecha.toString().split("T")[0];
                              var dateObject = new DateTime.fromISO(dateParts50); 

                              console.log(dateObject)

                              if(result[i].Aplicado==false)
                              {

                                colorAplicado='#f7347a'//rosa
                                color='#68B29A'
                                if(dateObject.ts<todayMillis)
                                {
                                  let status = 'Expirado'
                                  expirado='Expirado'
                                  color='#D47070'//rosa
                                  this.promesaService.updatePromesaEstatus(result[i]._id,status).subscribe()
                                }

                                if(dateObject.ts>todayMillis)
                                {
                                  expirado='Vigente'
                                  color='#68B29A'//verde
                                }

                                this.promesasPagoList[i] = {
                                  _id:result[i]._id,
                                  Fecha:result[i].Fecha.toString().split('T')[0],
                                  Cantidad:result[i].Cantidad,
                                  Expirado:expirado,
                                  Aplicado:result[i].Aplicado,
                                  Color:color,
                                  ColorAplicado:colorAplicado,
                                  Estatus:result[i].Estatus
                                }

                              }else if(result[i].Aplicado==true)
                              
                              {
                                expirado=result[i].Estatus

                                  color='#0A506A'//Azul 
                                  colorAplicado='#0A506A'//Azul 

                              
                                this.promesasPagoList[i] = {
                                  _id:result[i]._id,
                                  Fecha:result[i].Fecha.toString().split('T')[0],
                                  Cantidad:result[i].Cantidad,
                                  Expirado:expirado,
                                  Aplicado:result[i].Aplicado,
                                  Color:color,
                                  ColorAplicado:colorAplicado,
                                  Estatus:result[i].Estatus
                                }
                              }
                            }
                            this.dataSource = new MatTableDataSource(this.promesasPagoList);   
                            // this.dataSource.paginator = this.paginator ;
                            this.dataSource.sort = this.sort;
                          },
                          (err)=>{
                            if (err)
                            {
                              const modalRef = this.modalService.open(AlertsComponent,{ size: 'sm', backdrop:'static' })
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
                        this.subscription.push(sb)
    }
    
    
    formatDate(fecha:any){
      this.todayString= fecha.day+" de "+this.i18n.getMonthFullName(fecha.month)+" del "+fecha.year
      }


  loadForm() {

    this.noches= this.toDate.diff(this.fromDate, ["days"])

    // this.noches=-parseInt((this.huesped.llegada.toString()).split("/")[0])+parseInt((this.huesped.salida.toString()).split("/")[0])

    this.formGroupPromesa = this.fb.group({
      promesaPago:['',Validators.required],
      fechaPromesaPago : [this.fechaFinalBloqueo,Validators.required]
    })

    this.serviciosAdicionaledForm = this.fb.group({
      notas:[''],
      // adicional:['']
    })

    this.thirdForm = this.fb.group({
      pagoManualInput:['',Validators.compose([Validators.required,Validators.pattern("^[0-9]*$")])],
      // adicional:['']
    })

    this.forthForm = this.fb.group({
      pago:['Efectivo',Validators.required]

    })
  }

  get promesa (){
    return this.formGroupPromesa.controls
  }
  get getServiciosAdicionales (){
    return this.serviciosAdicionaledForm.controls
  }
  get getThirdForm (){
    return this.thirdForm.controls
  }
  get getforthForm (){
    return this.forthForm.controls
  }

  guardarAdicionales(){
    this.isLoading=true

    this.huesped.notas=this.getServiciosAdicionales.notas.value

   const sb = this.customerService.updateEstatusHuesped(this.huesped).subscribe(

      (value)=>{
        this.isLoading=false
        const modalRef = this.modalService.open(AlertsComponent, { size: 'sm', backdrop:'static' });
        modalRef.componentInstance.alertHeader='Exito'
        modalRef.componentInstance.mensaje = 'Datos del huesped Actualizados'
       
          setTimeout(() => {
            modalRef.close('Close click');
          },4000)      
       
      },
      (error)=>{
        this.isLoading=false

        if(error){
          const modalRef = this.modalService.open(AlertsComponent, { size: 'sm', backdrop:'static' });
        modalRef.componentInstance.alertHeader='Error'
        modalRef.componentInstance.mensaje = 'Error al Guardar Promesa de Pago'

          setTimeout(() => {
            modalRef.close('Close click');
          },4000)      
          this.promesasDisplay=false
        }
      },
      )
    
    this.subscription.push(sb)
  }

  guardarPromesa(){
    if(this.formGroupPromesa.invalid){  
      const modalRef = this.modalService.open(AlertsComponent,{ size: 'sm', backdrop:'static' })
      modalRef.componentInstance.alertHeader = 'Error'
      modalRef.componentInstance.mensaje='Seleccione una Fecha' 
      
      this.formGroupPromesa.markAllAsTouched();

      return
    }
this.isLoading=true
let estatus='Vigente'
  const sb =  this.promesaService.guardarPromesa(this.huesped.folio,this.promesa.fechaPromesaPago.value,this.promesa.promesaPago.value,estatus).subscribe(
      (value)=>{
        this.isLoading=false

        const modalRef = this.modalService.open(AlertsComponent, { size: 'sm', backdrop:'static' });
        modalRef.componentInstance.alertHeader='Exito'
        modalRef.componentInstance.mensaje = 'Promesa de Pago Generada con Exito'
        modalRef.result.then((result) => {
          this.closeResult = `Closed with: ${result}`;
          }, (reason) => {
              this.closeResult = `Dismissed ${this.getDismissReason(reason)}`;
          });
          setTimeout(() => {
            modalRef.close('Close click');
          },4000)      
          this.promesasDisplay=true
          this.formGroupPromesa.reset();
          this.promesasPagoList=[]
          this.getPromesa();
        },
      (err)=>{
        this.isLoading=false

        if(err){
          const modalRef = this.modalService.open(AlertsComponent, { size: 'sm', backdrop:'static' });
        modalRef.componentInstance.alertHeader='Error'
        modalRef.componentInstance.mensaje = 'Error al Guardar Promesa de Pago'
        modalRef.result.then((result) => {
          this.closeResult = `Closed with: ${result}`;
          }, (reason) => {
              this.closeResult = `Dismissed ${this.getDismissReason(reason)}`;
          });
          setTimeout(() => {
            modalRef.close('Close click');
          },4000)      
          this.promesasDisplay=false
        }
      },
      ()=>{}
      )
      this.subscription.push(sb)
  }

  togglePromesas(){
    if(this.promesasDisplay==false)
    {this.promesasDisplay=true}
    else if(this.promesasDisplay==true){
      this.promesasDisplay=false
    }
  }

  getAdicionales(): void {
    const sb = this.adicionalService.getAdicionales()
                        .subscribe((adicional)=>{
                          for(let i=0; i<adicional.length;i++)
                          {
                            this.adicionalArray.push(adicional[i])
                          }
                        })
this.subscription.push(sb)
  }


  setEstatus(value): void {

    for (let i=0;i<this.estatusArray.length;i++)
    {
      if(value==this.estatusArray[i].id)
      {
        this.huesped.estatus = this.estatusArray[i].estatus
        this.setLabel= this.estatusArray[i].color
      }
    }
  }

  estatusAplicado(row:any){
    if (row.Aplicado==true){
      this.next.emit()
    }
    else return
  }

  preguntasPrevias(row:any){

      if(row.Aplicado==false){
        const modalRef = this.modalService.open(this.preguntaPrevia,{ size: 'sm', backdrop:'static' })
        modalRef.result.then( (value) =>
        {

          let  pago = {
            
              _id : row._id,
              Fecha:row.Fecha,
              Cantidad:this.getThirdForm.pagoManualInput.value,
              Estatus:'Pago Hecho',
              Aplicado : true,
              Forma_De_Pago : this.getforthForm.pago.value
                  }
          this.idPromesa=row._id
            this.aplicarPromesa(pago)

        }
      );
      }else if (row.Aplicado==true)
      {
        const modalRef = this.modalService.open(AlertsComponent,{ size: 'sm', backdrop:'static' })
        modalRef.componentInstance.alertHeader='Error'
        modalRef.componentInstance.mensaje='Este pago ya fue aplicado'
        setTimeout(() => {
          modalRef.close('Close click');
        },4000)      
      }

    
    
  }



  aplicarPromesa(row:any){
    let pago : edoCuenta

    const dia = parseInt(row.Fecha.toString().split('/')[1])
    const mes = parseInt(row.Fecha.toString().split('/')[2])
    const ano = parseInt(row.Fecha.toString().split('/')[0])
    // const fechaPromesa = new Date(this.today.year,this.today.month,this.today.day)
    let fullFecha = this.today.day + " de " + this.i18n.getMonthFullName(this.today.month) + " del " + this.today.year.toString()

    pago = {

      Folio:this.customerService.getCurrentHuespedValue.folio,
      Fecha:this.today,
      Referencia:'Anticipo',
      Descripcion:'Promesa de Pago: ' + fullFecha,
      Forma_de_Pago: row.Forma_De_Pago,
      Cantidad:1,
      Cargo:0,
      Estatus:'Activo',
      Abono:row.Cantidad
    }


    this.isLoading=true
    const sb = this.edoCuentaService.agregarPago(pago).subscribe(
      (value)=>{
        this.isLoading=false
        
        const modalRef = this.modalService.open(AlertsComponent, { size: 'sm', backdrop:'static' })
        modalRef.componentInstance.alertHeader ='Exito'
        modalRef.componentInstance.mensaje ='Movimiento agregado al Estado de cuenta del cliente'
          setTimeout(() => {
            modalRef.close('Close click');
          },4000)
          this.promesaService.updatePromesa(this.idPromesa,row.Estatus).subscribe(
            (value)=>
            {
              if(this.huesped.estatus=='Reserva Sin Pago'||this.huesped.estatus=='Esperando Deposito')
              {
                this.huesped.estatus='Deposito Realizado'
              }
              this.customerService.updateEstatusHuesped(this.huesped).subscribe(
                (value)=>{
                  this.customerService.setCurrentHuespedValue=this.huesped
                  this.customerService.fetch(sessionStorage.getItem("HOTEL"));
                },
                (error)=>{

                }
              )
              this.promesasPagoList=[]
              this.getPromesa();
            },
            (error)=>{
              if(error)
              {
      
                const modalRef = this.modalService.open(AlertsComponent, { size: 'sm', backdrop:'static' });
                modalRef.componentInstance.alertHeader ='Error'
                modalRef.componentInstance.mensaje ='No se pudo actualizar el estatus de la Promesa'
  
                  setTimeout(() => {
                    modalRef.close('Close click');
                  },4000)
              }
            }
          )
      },
      (err)=>
      {
        this.isLoading=false
        if(err)
        {

          const modalRef = this.modalService.open(AlertsComponent, { size: 'sm', backdrop:'static' });
          modalRef.componentInstance.alertHeader ='Error'
        modalRef.componentInstance.mensaje ='No se pudo Guardar el Pago Intente Nuevamente'

        
            setTimeout(() => {
              modalRef.close('Close click');
            },4000)
              
          this.isLoading=false
      
        }
      },
      ()=>{//FINALLY
      }
      )
      this.isLoading=false
      this.subscription.push(sb)
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


  isControlValid(controlName: string): boolean {
    const control = this.formGroupPromesa.controls[controlName];
    return control.valid && (control.dirty || control.touched);
  }

  isControlInvalid(controlName: string): boolean {
    const control = this.formGroupPromesa.controls[controlName];

    return control.invalid && (control.dirty || control.touched);
  }
//ThirdsForm
isControlValidThird(controlName: string): boolean {
  const control = this.thirdForm.controls[controlName];
  return control.valid && (control.dirty || control.touched);
}

isControlInvalidThird(controlName: string): boolean {
  const control = this.thirdForm.controls[controlName];

  return control.invalid && (control.dirty || control.touched);
}

controlHasErrorThird(validation, controlName): boolean {
  const control = this.thirdForm.controls[controlName];
  return control.hasError(validation) && (control.dirty || control.touched);
}


  ngOnDestroy(): void {
    this.subscriptions.forEach(sb => sb.unsubscribe());
  }
}