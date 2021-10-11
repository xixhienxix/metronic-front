import { Component, OnInit, ViewChild } from '@angular/core';
import { Form, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { ModalDismissReasons, NgbCalendar, NgbDate, NgbDatepickerI18n, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { Subscription } from 'rxjs';
import { Adicional } from 'src/app/pages/reportes/_models/adicional.model';
import { Huesped } from 'src/app/pages/reportes/_models/customer.model';
import { Estatus } from 'src/app/pages/reportes/_models/estatus.model';
import { Promesa } from 'src/app/pages/reportes/_models/promesa.model';
import { HuespedService } from 'src/app/pages/reportes/_services';
import { AdicionalService } from 'src/app/pages/reportes/_services/adicional.service';
import { PromesaService } from 'src/app/pages/reportes/_services/promesa.service';
import { AlertsComponent } from '../../../../helpers/alerts-component/alerts/alerts.component';
import { EditReservaModalComponent } from '../../../edit-reserva-modal.component';

const todayDate = new Date();
const todayString = todayDate.getUTCDate()+"/"+todayDate.getUTCMonth()+"/"+todayDate.getUTCFullYear()+"-"+todayDate.getUTCHours()+":"+todayDate.getUTCMinutes()+":"+todayDate.getUTCSeconds()


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
  creada:todayString,
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

  formGroup:FormGroup
  formGroupPromesa:FormGroup
  serviciosAdicionaledForm:FormGroup
  /*Date Variables*/
  fullFechaSalida:string
  fullFechaLlegada:string
  fromDate: NgbDate | null;
  toDate: NgbDate | null;
  comparadorInicial:Date
  comparadorFinal:Date
  fechaFinalBloqueo:string
  fechaInicialBloqueo:string
  noches:number;
  closeResult:string;

  /*Models*/
  huesped: Huesped = EMPTY_CUSTOMER;
  adicionalArray:Adicional[]=[];
  estatusArray:Estatus[]=[];
  promesasPagoList:any[]=[];
  private subscriptions: Subscription[] = [];
  clickedRow = new Set<any>()

  /*TABLE*/
  displayedColumns: string[] = ['select','_id','Fecha', 'Cantidad'];
  dataSource: MatTableDataSource<Promesa>;

  /*Diseño Dinamico*/
  changeStyleHidden:string = 'display:none'
  setLabel:string="label label-lg label-light-primary label-inline"
  promesasDisplay:boolean=false;
  expired:boolean=false;
  isLoading:boolean=false;


  constructor(
    public i18n: NgbDatepickerI18n,
    private adicionalService : AdicionalService,
    private calendar: NgbCalendar,
    public customerService : HuespedService,
    public fb : FormBuilder,
    public modalService: NgbModal,
    public promesaService : PromesaService
  ) {  
    this.fromDate = calendar.getToday();
    // this.toDate = calendar.getNext(calendar.getToday(), 'd', 1); 
    this.toDate=calendar.getToday();
    this.fechaFinalBloqueo=this.toDate.day+" de "+this.i18n.getMonthFullName(this.toDate.month)+" del "+this.toDate.year }

  ngOnInit(): void {

    this.getAdicionales();
    this.customerService.huespedUpdate$.subscribe((value)=>{
      this.huesped=value

      this.getPromesa();
      this.formatFechas();
      this.loadForm();
    })

  }

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  
    eliminarPromesa(_id:any){
      this.isLoading=true
      this.promesaService.borrarPromesa(_id).subscribe(
        (result)=>{
          this.isLoading=false
          const modalRef = this.modalService.open(AlertsComponent,{size:'sm'})
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
                              const modalRef = this.modalService.open(AlertsComponent,{size:'sm'})
                              modalRef.componentInstance.mensaje='No se Pudo Cargar la Tabla'
                              modalRef.componentInstance.alertHeader='Error'
                                setTimeout(() => {
                                  modalRef.close('Close click');
                                },4000)
                            }
        }
        )
    }

    getPromesa()
    {
    this.promesaService.getPromesas(this.huesped.folio).subscribe(
                          (result)=>{
                            
                            for(let i =0;i<result.length;i++){
                                let today= new Date

                              const dia = parseInt(result[i].Fecha.split("/")[0])
                              const mes = parseInt(result[i].Fecha.split("/")[1])
                              const ano = parseInt(result[i].Fecha.split("/")[2])
                              const fechaPromesa = new Date(ano,mes-1,dia)

                              let fullFecha = fechaPromesa.getUTCDate().toString() + " de " + this.i18n.getMonthFullName(fechaPromesa.getUTCMonth()) + " del " + fechaPromesa.getFullYear().toString()
                              
                              this.promesasPagoList[i] = {
                                _id:result[i]._id,
                                Fecha:fullFecha,
                                Cantidad:result[i].Cantidad,
                              }
                            }
                            this.dataSource = new MatTableDataSource(this.promesasPagoList);   
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
    
    
   formatFechas()
    {
      const diaLlegada = parseInt(this.huesped.llegada.split("/")[0])
      const mesLlegada = parseInt(this.huesped.llegada.split("/")[1])
      const anoLlegada = parseInt(this.huesped.llegada.split("/")[2])
      const fechaLlegada = new Date(anoLlegada,mesLlegada,diaLlegada)
      this.fullFechaLlegada = fechaLlegada.getUTCDate().toString() + "/" + this.i18n.getMonthShortName(fechaLlegada.getUTCMonth()) + "/" + fechaLlegada.getFullYear().toString()

      const diaSalida = parseInt(this.huesped.salida.split("/")[0])
      const mesSalida = parseInt(this.huesped.salida.split("/")[1])
      const anoSalida = parseInt(this.huesped.salida.split("/")[2])
      const fechaSalida = new Date(anoSalida,mesSalida,diaSalida)
      this.fullFechaSalida = fechaSalida.getUTCDate().toString() + "/" + this.i18n.getMonthShortName(fechaSalida.getUTCMonth()) + "/" + fechaSalida.getFullYear().toString()
    }

  loadForm() {

    this.noches=-parseInt((this.huesped.llegada.toString()).split("/")[0])+parseInt((this.huesped.salida.toString()).split("/")[0])

    this.formGroupPromesa = this.fb.group({
      promesaPago:['',Validators.required],
      fechaPromesaPago : [new Date(Date.now()).toLocaleString(),Validators.required]
    })

    this.serviciosAdicionaledForm = this.fb.group({
      notas:[''],
      // adicional:['']
    })

  }

  get promesa (){
    return this.formGroupPromesa.controls
  }
  get getServiciosAdicionales (){
    return this.serviciosAdicionaledForm.controls
  }

  guardarAdicionales(){
    this.isLoading=true

    this.huesped.notas=this.getServiciosAdicionales.notas.value

    this.customerService.updateEstatusHuesped(this.huesped).subscribe(

      (value)=>{
        this.isLoading=false
        const modalRef = this.modalService.open(AlertsComponent, {size:'sm'});
        modalRef.componentInstance.alertHeader='Exito'
        modalRef.componentInstance.mensaje = 'Datos del huesped Actualizados'
       
          setTimeout(() => {
            modalRef.close('Close click');
          },4000)      
       
      },
      (error)=>{
        this.isLoading=false

        if(error){
          const modalRef = this.modalService.open(AlertsComponent, {size:'sm'});
        modalRef.componentInstance.alertHeader='Error'
        modalRef.componentInstance.mensaje = 'Error al Guardar Promesa de Pago'

          setTimeout(() => {
            modalRef.close('Close click');
          },4000)      
          this.promesasDisplay=false
        }
      },
      )
    
    
  }

  guardarPromesa(){
    if(this.formGroupPromesa.invalid){
      
      const modalRef = this.modalService.open(AlertsComponent,{size:'sm'})
      modalRef.componentInstance.alertHeader = 'Error'
      modalRef.componentInstance.mensaje='Complete los Datos' 
      
      this.formGroupPromesa.markAllAsTouched();

      return
    }
this.isLoading=true
    this.promesaService.guardarPromesa(this.huesped.folio,this.promesa.fechaPromesaPago.value,this.promesa.promesaPago.value).subscribe(
      (value)=>{
        this.isLoading=false

        const modalRef = this.modalService.open(AlertsComponent, {size:'sm'});
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
          const modalRef = this.modalService.open(AlertsComponent, {size:'sm'});
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
  }

  togglePromesas(){
    if(this.promesasDisplay==false)
    {this.promesasDisplay=true}
    else if(this.promesasDisplay==true){
      this.promesasDisplay=false
    }
  }

  getAdicionales(): void {
    this.adicionalService.getAdicionales()
                        .subscribe((adicional)=>{
                          for(let i=0; i<adicional.length;i++)
                          {
                            this.adicionalArray.push(adicional[i])
                          }
                        })

  }

//   servicioAdicional(event,adicional,descripcion){
//     if(event.checked)
//     {     
//       this.huesped.tarifa=adicional+this.huesped.tarifa
//       this.huesped.pendiente=this.huesped.pendiente+adicional
//       this.huesped.porPagar=this.huesped.porPagar+adicional
//     }
//     else if(!event.checked){
//       this.huesped.tarifa=this.huesped.tarifa-adicional
//       this.huesped.pendiente=this.huesped.pendiente-adicional
//       this.huesped.porPagar=this.huesped.porPagar-adicional
// }
    
  //}

  fechaSeleccionadaFinal(event){
    this.fromDate = event

    this.comparadorInicial = new Date(event.year,event.month-1,event.day)
  
    this.fechaFinalBloqueo= event.day+" de "+this.i18n.getMonthFullName(event.month)+" del "+event.year
  
    if(this.comparadorInicial>this.comparadorFinal)
    {
    }
    else if(this.comparadorInicial<this.comparadorFinal)
    {
      
    }
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



  ngOnDestroy(): void {
    this.subscriptions.forEach(sb => sb.unsubscribe());
  }
}
