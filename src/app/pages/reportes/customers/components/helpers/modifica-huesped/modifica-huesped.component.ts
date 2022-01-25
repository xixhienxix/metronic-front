import { Component, OnInit, ViewChild, EventEmitter,Output } from '@angular/core';
import { NgbActiveModal, NgbDateStruct } from '@ng-bootstrap/ng-bootstrap';
import { Huesped } from 'src/app/pages/reportes/_models/customer.model';
import { EstatusService } from 'src/app/pages/reportes/_services/estatus.service';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { HuespedService } from 'src/app/pages/reportes/_services';
import { ModalDismissReasons} from '@ng-bootstrap/ng-bootstrap';
import { NgbDatepickerI18n, } from '@ng-bootstrap/ng-bootstrap';
import { NgbDate } from '@ng-bootstrap/ng-bootstrap';
import { DisponibilidadService } from 'src/app/pages/reportes/_services/disponibilidad.service';
import { map } from 'rxjs/operators';
import { Disponibilidad } from 'src/app/pages/reportes/_models/disponibilidad.model';
import { HabitacionesService } from 'src/app/pages/reportes/_services/habitaciones.service';
import { Habitaciones } from 'src/app/pages/reportes/_models/habitaciones.model';
import { FormBuilder,FormGroup,Validators } from '@angular/forms';
import { NgbCalendar } from '@ng-bootstrap/ng-bootstrap';
import { isThisTypeNode } from 'typescript';
import { AlertsComponent } from '../../../../../../main/alerts/alerts.component';
import { DivisasService } from 'src/app/pages/parametros/_services/divisas.service';
import {DateTime} from 'luxon'
import { ParametrosServiceService } from 'src/app/pages/parametros/_services/parametros.service.service';
import { Subscription } from 'rxjs';
import { Edo_Cuenta_Service } from 'src/app/pages/reportes/_services/edo_cuenta.service';

@Component({
  selector: 'app-modifica-huesped',
  templateUrl: './modifica-huesped.component.html',
  styleUrls: ['./modifica-huesped.component.scss']
})
export class ModificaHuespedComponent implements OnInit {
  @Output() passEntry: EventEmitter<any> = new EventEmitter();

  @ViewChild('matSelect') matSelect = null;

  huesped:Huesped;
  huespedAnterior:Huesped;
  huespedSuperAnterior:Huesped;
  fullFechaSalida:string;
  fullFechaLlegada:string;
  closeResult: string;
  //mensajes personalizados
  mensaje_exito:string;
  mensaje_error:string;

  placeHolder:string="-- Seleccione Habitación --"
  //BUSCA DISPO
  inicio:boolean=false;
  accordionDisplay:string="";
  bandera:boolean=false;
  diaDif:number;
  selected:boolean = false;

  //Fechas

  model: NgbDateStruct;
  fromDate: DateTime | null;
  today: DateTime | null;
  comparadorInicial:DateTime;
  display:boolean=true;
  comparadorFinal:DateTime
  toDate: DateTime | null;
  minDate:{year:number,month:number,day:number}
  llegadaString:string
  salidaString:string
  //Disponibilidad
  isLoading:boolean=false;

  cuarto:string;
  numCuartoNumber:number;
  tarifa:number;
  codigoCuartoString:string;
  codigo:any[]=[]

  /*Subscription*/
  subscription:Subscription[]=[]

  sinDisponibilidad:any[]=[]
  mySet = new Set();
  disponibilidad:Disponibilidad[]=[];
  cuartos:Habitaciones[]=[];
  codigoCuarto:any[]=[];
  numCuarto: Array<number>=[];
  tipodeCuartoFiltrados:Array<string>=[];
  infoCuarto:any[]=[];
  personasXCuarto:any[]=[];
  expandedPane:boolean;
  fechaInicialDisplay:boolean=true;
  fechaFinalDisplay:boolean=true;

  //Forms
  modificaHuespedFormGroup: FormGroup;
  fechasFormGroup: FormGroup;
  public tipoCuartoForm: FormBuilder;

  constructor(
    public modal: NgbActiveModal,
    public estatusService:EstatusService,
    private modalService: NgbModal,
    public customerService: HuespedService,
    public i18n: NgbDatepickerI18n,
    public disponibilidadService: DisponibilidadService,
    public habitacionService:HabitacionesService,
    public fb: FormBuilder,
    private calendar: NgbCalendar,
    public divisasService:DivisasService,
    public parametrosService : ParametrosServiceService,
    public edoCuentaService : Edo_Cuenta_Service
  ) { 

    const current = DateTime.now().setZone(this.parametrosService.getCurrentParametrosValue.zona)
    this.minDate = {year:current.year,month:current.month,day:current.day}
    this.today = DateTime.now().setZone(this.parametrosService.getCurrentParametrosValue.zona)
    
   
  }

  ngOnInit(): void {
    
    const ano = this.huesped.llegada.split("/")[2]
    const mes = this.huesped.llegada.split("/")[1]
    const dia = this.huesped.llegada.split("/")[0]

    const anoS = this.huesped.salida.split("/")[2]
    const mesS = this.huesped.salida.split("/")[1]
    const diaS = this.huesped.salida.split("/")[0]

    this.fromDate = DateTime.fromObject({day:dia,month:mes,year:ano});
    this.toDate = DateTime.fromObject({day:diaS,month:mesS,year:anoS});

    this.fullFechaLlegada = this.fromDate.day + " de " + this.i18n.getMonthFullName(this.fromDate.month) + " del " + this.fromDate.year
    this.fullFechaSalida = this.toDate.day + " de " + this.i18n.getMonthFullName(this.toDate.month) + " del " + this.toDate.year

    this.llegadaString=this.huesped.llegada
    this.salidaString=this.huesped.salida

    this.comparadorInicial = this.fromDate
    this.comparadorFinal = this.toDate

    this.diaDif=this.toDate.diff(this.fromDate, ["days"])

    

    this.loadForm();
    this.getCodigosCuarto();
    this.getHabitaciones();
    this.inicio=true;
  }

  loadForm() {

    this.fechasFormGroup = this.fb.group({
      fechaInicial:[''],
      fechaFinal:[''],
      id:['']
    })


    this.diasDiferencia();
    
    if(this.diaDif==0)
    {
      this.diaDif=1;
    }
  }

  getHabitaciones()
  {
   const sb = this.habitacionService.gethabitaciones()
    .subscribe((infoCuartos)=>{
      this.cuartos=(infoCuartos)

      this.infoCuarto=infoCuartos
      for(let i=0;i<this.infoCuarto.length;i++)
      {
       const exist = this.personasXCuarto.find(x => x.Codigo === this.infoCuarto[i].Codigo);
       
       if(exist===undefined)
       { 
         this.personasXCuarto.push(this.infoCuarto[i])
       }
      }
    })

    this.subscription.push(sb)
   
  }

  getCodigosCuarto()
  {
    this.codigoCuarto=[]
   const sb =  this.habitacionService.getCodigohabitaciones()
    .pipe(map(
      (responseData)=>{
        const postArray = []
        for(const key in responseData)
        {
          if(responseData.hasOwnProperty(key))
          postArray.push(responseData[key]);
        }
        return postArray
      }))
      .subscribe((codigoCuarto)=>{
        this.codigoCuarto=(codigoCuarto)
      })

      this.subscription.push(sb)
  }



 get fechas (){return this.fechasFormGroup.controls}


  fechaSeleccionadaInicial(event:NgbDate){
    this.expandedPane=true;
    this.inicio=false;
    // this.cuarto=this.huesped.habitacion;
    this.sinDisponibilidad=[];
    this.accordionDisplay="";
    this.fechasFormGroup.get('id').setValue(0);


    this.accordionDisplay="display:none";

    // this.fromDate = DateTime.fromObject({year:event.year,month:event.month,day:event.day}) 

    this.llegadaString=event.day+"/"+event.month+"/"+event.year

    this.comparadorInicial = DateTime.fromObject({year:event.year,month:event.month,day:event.day})
  
    this.fullFechaLlegada= event.day+" de "+this.i18n.getMonthFullName(event.month)+" del "+event.year
  
    if(this.comparadorInicial>=this.comparadorFinal)
    {
      this.display=false
    }else if(this.comparadorInicial<=this.comparadorFinal)
    {this.display=true}

    this.expandedPane=true;
    this.sinDisponibilidad=[];
    this.diasDiferencia();
  }


  fechaSeleccionadaFinal(event:NgbDate){
    this.expandedPane=true;
    this.inicio=false;
    // this.cuarto=this.huesped.habitacion;
    this.sinDisponibilidad=[];
    this.accordionDisplay="";
    this.fechasFormGroup.get('id').setValue(0);


    this.accordionDisplay="display:none";
    // this.toDate = DateTime.fromObject({year:event.year,month:event.month,day:event.day}) 

    this.salidaString=event.day+"/"+event.month+"/"+event.year

    this.comparadorFinal = DateTime.fromObject({year:event.year,month:event.month,day:event.day})
  
    this.fullFechaSalida= event.day+" de "+this.i18n.getMonthFullName(event.month)+" del "+event.year
  
    if(this.comparadorInicial>=this.comparadorFinal)
    {
      this.display=false
    }else if(this.comparadorInicial<=this.comparadorFinal)
    {this.display=true}

    this.expandedPane=true;
    this.sinDisponibilidad=[];
    this.diasDiferencia();

  }

  diasDiferencia(){

    this.diaDif=this.comparadorFinal.diff(this.comparadorInicial, ["days"])

  }

  habValue(codigoHabitacion:string)
  {
    this.mySet.clear()

    this.isLoading=true;
    this.expandedPane=true;
    this.sinDisponibilidad=[];
    this.accordionDisplay="";
    this.cuarto=codigoHabitacion;

    let diaDif = this.comparadorFinal.diff(this.comparadorInicial, ["years", "months", "days", "hours"])
    this.diaDif = diaDif.days

    this.bandera=false;
    const comparadorInicialString=this.comparadorInicial.day+'/'+this.comparadorInicial.month+'/'+this.comparadorInicial.year
    const comparadorFinalString=this.comparadorFinal.day+'/'+this.comparadorFinal.month+'/'+this.comparadorFinal.year

    if(this.cuarto=='1'){this.bandera=true}else{this.bandera=false}
    
    const sb =this.disponibilidadService.getDisponibilidadCompleta(comparadorInicialString,comparadorFinalString,codigoHabitacion,this.huesped.numeroCuarto,this.diaDif, this.huesped.folio)
    .subscribe(
      (disponibles)=>{
        if(disponibles.length==0){this.inicio=false}
        for(let i=0;i<=disponibles.length;i++){
          this.mySet.add(disponibles[i])
        }
        this.isLoading=false

      },
      (error)=>{})
    
      this.subscription.push(sb)
  
  }

  cuartoValue(selected:boolean,value:any)
  {

   const sb =  this.habitacionService.getHabitacionbyNumero(value)
      .subscribe((cuartos)=>{
        this.codigo=(cuartos)
      })

      this.subscription.push(sb)

  }

  closeModal(){
    this.modal.close();
  }


    habitacionSeleccionada(cuarto:number,codigo:string,tarifa:number){
      this.numCuartoNumber=cuarto;
      this.codigoCuartoString=codigo;
      this.tarifa=tarifa;
    }

    actualizarDatos(){

      if(this.cuarto==undefined)
      { 
        const modalRef=this.modalService.open(AlertsComponent,{ size: 'sm', backdrop:'static' })
        modalRef.componentInstance.alertHeader='Advertencia'
        modalRef.componentInstance.mensaje='No ah seleccionado ninguna habitacion, seleccione una habitación para continuar'
        modalRef.result.then((result) => {
          this.closeResult = `Closed with: ${result}`;
          }, (reason) => {
              this.closeResult = `Dismissed ${this.getDismissReason(reason)}`;
          });
          setTimeout(() => {
            modalRef.close('Close click');
          },4000)

          return
      }
      if(this.comparadorInicial.startOf("day") == this.fromDate.startOf("day") && this.comparadorFinal.startOf("day") == this.toDate.startOf("day") && this.huesped.numeroCuarto == this.numCuartoNumber && this.huesped.habitacion == this.codigoCuartoString)
      {
        const modalRef=this.modalService.open(AlertsComponent,{ size: 'sm', backdrop:'static' })
        modalRef.componentInstance.alertHeader='Advertencia'
        modalRef.componentInstance.mensaje='No hay Datos que Actualizar'
        modalRef.result.then((result) => {
          this.closeResult = `Closed with: ${result}`;
          }, (reason) => {
              this.closeResult = `Dismissed ${this.getDismissReason(reason)}`;
          });
          setTimeout(() => {
            modalRef.close('Close click');
          },4000)

          return
      }


   const sb = this.customerService.updateHuespedModifica(this.customerService.getCurrentHuespedValue).subscribe(
      (value)=>{
        
    this.huesped.noches=this.diaDif
    this.huesped.tarifa=this.tarifa
    this.huesped.habitacion=this.codigoCuartoString
    this.huesped.numeroCuarto=this.numCuartoNumber,
    this.huesped.pendiente=this.huesped.tarifa*this.diaDif
    this.huesped.porPagar=this.huesped.tarifa*this.diaDif

    
    this.huesped.llegada=this.comparadorInicial.day+'/'+this.comparadorInicial.month+'/'+this.comparadorInicial.year
    this.huesped.salida=this.comparadorFinal.day+'/'+this.comparadorFinal.month+'/'+this.comparadorFinal.year

     const sb = this.customerService.updateHuesped(this.huesped).subscribe(
        (value)=>{

         const alojamientoNuevo = this.tarifa * this.diaDif
         const alojamiento = this.edoCuentaService.currentCuentaValue.filter(alojamiento=>alojamiento.Descripcion=='Alojamiento')

          this.edoCuentaService.actualizaSaldo(alojamiento[0]._id,alojamientoNuevo).subscribe(
            (value)=>
            { console.log(value)  
              
              this.edoCuentaService.sendNotification(true)
            },
            (error)=>{  
              console.log(error)
             })          
             
          this.customerService.setCurrentHuespedValue=this.huesped
          this.passEntry.emit(this.huesped);

          const modalRef=this.modalService.open(AlertsComponent,{ size: 'sm', backdrop:'static' })
          modalRef.componentInstance.alertHeader='Exito'
          modalRef.componentInstance.mensaje='Datos del Húesped Actualizados con Exito'
          modalRef.result.then((result) => {
            this.closeResult = `Closed with: ${result}`;
            }, (reason) => {
                this.closeResult = `Dismissed ${this.getDismissReason(reason)}`;
            });
            setTimeout(() => {
              modalRef.close('Close click');
            },4000)

            this.modal.close(this.huesped)
        },
        (err)=>{
          if(err)
          {
            const modalRef=this.modalService.open(AlertsComponent,{ size: 'sm', backdrop:'static' })
            modalRef.componentInstance.alertHeader = 'Error'
            modalRef.componentInstance.mensaje='Ocurrio un Error al actualizar al húesped'
            modalRef.result.then((result) => {
              this.closeResult = `Closed with: ${result}`;
              }, (reason) => {
                  this.closeResult = `Dismissed ${this.getDismissReason(reason)}`;
              });
              setTimeout(() => {
                modalRef.close('Close click');
              },4000)
            }

        })
        this.subscription.push(sb)
        
        
      },
      (error)=>
      { 
      
      })
      this.subscription.push(sb)
   }

    okayChecked() {
      this.matSelect.close()
    }

    toggleCalendarioInicial(){
      if(this.fechaInicialDisplay==true){
        this.fechaInicialDisplay=false
      }else if (this.fechaInicialDisplay==false)
      {this.fechaInicialDisplay=true}
    }
    toggleCalendarioFinal(){
     if(this.fechaFinalDisplay==true) 
     {this.fechaFinalDisplay=false}
     else if(this.fechaFinalDisplay==false)
     {this.fechaFinalDisplay=true}
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
      this.subscription.forEach(sb => sb.unsubscribe())
    }
}
