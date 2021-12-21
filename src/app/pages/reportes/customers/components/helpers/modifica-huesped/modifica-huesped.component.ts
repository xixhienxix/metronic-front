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
  llegadaTemp:string
  salidaTemp:string
  //Disponibilidad

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
    public parametrosService : ParametrosServiceService

  ) { 
    const current = DateTime.now().setZone(parametrosService.getCurrentParametrosValue.zona)
    this.minDate = {year:current.year,month:current.month,day:current.day}
    this.today= DateTime.now().setZone(parametrosService.getCurrentParametrosValue.zona)
 
  }

  ngOnInit(): void {
    this.llegadaTemp=this.huesped.llegada
    this.salidaTemp=this.huesped.salida
    const ano = this.huesped.llegada.split("/")[2]
    const mes = this.huesped.llegada.split("/")[1]
    const dia = this.huesped.llegada.split("/")[0]

    const anoS = this.huesped.salida.split("/")[2]
    const mesS = this.huesped.salida.split("/")[1]
    const diaS = this.huesped.salida.split("/")[0]

    this.fromDate = DateTime.fromObject({day:dia,month:mes,year:ano});
    this.toDate = DateTime.fromObject({day:diaS,month:mesS,year:anoS});

    this.formatFechas();
    this.loadForm();
    this.getCodigosCuarto();
    this.getHabitaciones();
    this.inicio=true;
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
         this.personasXCuarto.push(this.infoCuarto[i])//FUNCIONO
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

  loadForm() {

    // this.modificaHuespedFormGroup = this.fb.group({
    //   'tipoCuarto': [ undefined, Validators.required ],
    //   'numeroHab' : [undefined,Validators.required],

    // });
    this.huespedAnterior = this.huesped

    this.fechasFormGroup = this.fb.group({
      fechaInicial:[''],
      fechaFinal:['']
    })


    this.diasDiferencia();
    
    if(this.diaDif==0)
    {
      this.diaDif=1;
    }
  }

 get fechas (){return this.fechasFormGroup.controls}


  formatFechas()
  {
    const diaLlegada = parseInt(this.huesped.llegada.split("/")[0])
    const mesLlegada = parseInt(this.huesped.llegada.split("/")[1])
    const anoLlegada = parseInt(this.huesped.llegada.split("/")[2])
    const fechaLlegada = DateTime.fromObject({year:anoLlegada,month:mesLlegada,day:diaLlegada})
    this.fullFechaLlegada = fechaLlegada.day.toString() + "/" + this.i18n.getMonthFullName(fechaLlegada.month) + "/" + fechaLlegada.year.toString()

    const diaSalida = parseInt(this.huesped.salida.split("/")[0])
    const mesSalida = parseInt(this.huesped.salida.split("/")[1])
    const anoSalida = parseInt(this.huesped.salida.split("/")[2])
    const fechaSalida = DateTime.fromObject({year:anoSalida,month:mesSalida,day:diaSalida})
    this.fullFechaSalida = fechaSalida.day.toString() + "/" + this.i18n.getMonthFullName(fechaSalida.month) + "/" + fechaSalida.year.toString()
  }

  fechaSeleccionadaInicial(event:NgbDate){
    this.accordionDisplay="display:none";

    this.fromDate = DateTime.fromObject({year:event.year,month:event.month,day:event.day}) 

    this.llegadaTemp=event.day+"/"+event.month+"/"+event.year

    this.comparadorInicial = DateTime.fromObject({year:event.year,month:event.month,day:event.day})
  
    this.fullFechaLlegada= event.day+" de "+this.i18n.getMonthFullName(event.month)+" del "+event.year
  
    if(this.comparadorInicial>this.comparadorFinal)
    {
      this.display=false
    }else if(this.comparadorInicial<this.comparadorFinal)
    {this.display=true}

    this.expandedPane=true;
    this.sinDisponibilidad=[];
    this.diasDiferencia();
  }


  fechaSeleccionadaFinal(event:NgbDate){
    this.accordionDisplay="display:none";

    this.toDate = DateTime.fromObject({year:event.year,month:event.month,day:event.day}) 


    this.salidaTemp=event.day+"/"+event.month+"/"+event.year

    this.comparadorFinal = DateTime.fromObject({year:event.year,month:event.month,day:event.day})
  
    this.fullFechaSalida= event.day+" de "+this.i18n.getMonthFullName(event.month)+" del "+event.year
  
    if(this.comparadorInicial>this.comparadorFinal)
    {
      this.display=false
    }else if(this.comparadorInicial<this.comparadorFinal)
    {this.display=true}

    this.expandedPane=true;
    this.sinDisponibilidad=[];
    this.diasDiferencia();

  }

  diasDiferencia(){

    this.diaDif=this.fromDate.diff(this.toDate, ["days"])

  }

  habValue(codigoHabitacion:string)
  {
    this.expandedPane=true;
    this.inicio=false;
    this.cuarto=codigoHabitacion;
    this.sinDisponibilidad=[];
    this.accordionDisplay="";

    const diaLlegada = parseInt(this.huesped.llegada.split("/")[0])
    const mesLlegada = parseInt(this.huesped.llegada.split("/")[1])
    const anoLlegada = parseInt(this.huesped.llegada.split("/")[2])
    const fechaLlegadaPrevia = DateTime.fromObject({year:anoLlegada,month:mesLlegada,day:diaLlegada})

    const diaSalida = parseInt(this.huesped.salida.split("/")[0])
    const mesSalida = parseInt(this.huesped.salida.split("/")[1])
    const anoSalida = parseInt(this.huesped.salida.split("/")[2])
    const fechaSalidaPrevia = DateTime.fromObject({year:anoSalida,month:mesSalida,day:diaSalida})
    
    //  let toDate =   new Date(this.toDate.year, this.toDate.month - 1, this.toDate.day);
    //  let fromDate = new Date(this.fromDate.year, this.fromDate.month - 1, this.fromDate.day);
    // let diaDif = Math.floor((Date.UTC(toDate.getFullYear(), toDate.getMonth(), toDate.getDate()) - Date.UTC(fromDate.getFullYear(), fromDate.getMonth(), fromDate.getDate()) ) / (1000 * 60 * 60 * 24))
    
    let diaDif = this.toDate.diff(this.fromDate, ["years", "months", "days", "hours"])
    this.diaDif = diaDif.days

    let dispoFromDate = this.fromDate
    let dispoToDate = this.toDate

    if(codigoHabitacion=='1')
    {
          this.bandera=true
          // this.bandera=false;
          for (let i=0; i<(diaDif.days+1); i++) 
            {
          const sb = this.disponibilidadService.getdisponibilidadTodos(dispoFromDate.day, dispoFromDate.month, dispoFromDate.year)
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
              .subscribe((disponibles)=>{
                this.mySet.clear()
    
                for(i=0;i<disponibles.length;i++)
                {
                  this.disponibilidad=(disponibles)
                  if(disponibles[i].Estatus==0)
                  {
                    if(!(dispoFromDate.ts >= fechaLlegadaPrevia.ts && dispoFromDate.ts <= fechaSalidaPrevia.ts))
                    {
                      this.sinDisponibilidad.push(disponibles[i].Habitacion)
                    }
                                    }
                  this.mySet.add(this.disponibilidad[i].Habitacion)
                }
                for(i=0;i<this.sinDisponibilidad.length;i++)
                {
                  this.mySet.delete(this.sinDisponibilidad[i])
                }
                if(dispoToDate.ts< fechaSalidaPrevia.ts && dispoToDate.ts > fechaLlegadaPrevia.ts)
                {
                  this.mySet.add(this.huesped.numeroCuarto)
                }
              })
              dispoFromDate.plus({ days: 1 })
              this.subscription.push(sb)
            };
        // })
    }

    else
    {
      this.bandera=false;
      for (let i=0; i<(diaDif.days+1); i++)  
      {

      const sb = this.disponibilidadService.getdisponibilidad(dispoFromDate.day, dispoFromDate.month, dispoFromDate.year,this.cuarto)
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
        .subscribe((disponibles)=>{
          this.mySet.clear()
          for(i=0;i<disponibles.length;i++)
          {
            this.disponibilidad=(disponibles)
            if(disponibles[i].Estatus==0)
            {
              if(!(dispoFromDate.ts >= fechaLlegadaPrevia.ts && dispoFromDate.ts <= fechaSalidaPrevia.ts))
              {
                this.sinDisponibilidad.push(disponibles[i].Habitacion)
              }
            }
             this.mySet.add(this.disponibilidad[i].Habitacion)
          }
          for(i=0;i<this.sinDisponibilidad.length;i++)
          {
            this.mySet.delete(this.sinDisponibilidad[i])
          }
        })
        dispoFromDate.plus({ days: 1 })
        this.subscription.push(sb)
      };
    }

   
  }

  cuartoValue(selected:boolean,value:any)
  {
    let index;
    let indexTipo;
    ;

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

    // revisaDatos(){
    //   if(this.numCuartoNumber==undefined||this.codigoCuartoString==undefined)
    //   {
    //     const modalRef = this.modalService.open(AlertsComponent,{ size: 'sm', backdrop:'static' })
    //     modalRef.componentInstance.alertHeader='Error'
    //     modalRef.componentInstance.mensaje='Debes seleccionar una habitacion antes de guardar los cambios'
    //     modalRef.result.then((result) => {
    //       this.closeResult = `Closed with: ${result}`;
    //       }, (reason) => {
    //           this.closeResult = `Dismissed ${this.getDismissReason(reason)}`;
    //       });
    //       setTimeout(() => {
    //         modalRef.close('Close click');
    //       },4000)
    //   }else 
    //   {
    //     this.actualizarDatos();
    //   }
    // }
    actualizarDatos(){
      
    this.huesped.noches=this.diaDif

    this.huesped.tarifa=this.tarifa
   
    this.huesped.habitacion=this.codigoCuartoString
    this.huesped.numeroCuarto=this.numCuartoNumber,
    this.huesped.pendiente=this.huesped.tarifa*this.diaDif
    this.huesped.porPagar=this.huesped.tarifa*this.diaDif
    this.huesped.llegada=this.llegadaTemp
    this.huesped.salida=this.salidaTemp

   const sb = this.customerService.updateHuespedModifica(this.huespedAnterior).subscribe(
      (value)=>{
        
     const sb = this.customerService.updateHuesped(this.huesped).subscribe(
        (value)=>{

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
          // const modalRef=this.modalService.open(AlertsComponent,{ size: 'sm', backdrop:'static' })
          // modalRef.componentInstance.alertHeader = 'Exito'
          // modalRef.componentInstance.mensaje='Disponibilidad liberada con exito'
        
      },
      (error)=>
      { 
        // if(error)
        // {
        //   const modalRef=this.modalService.open(AlertsComponent,{ size: 'sm', backdrop:'static' })
        //   modalRef.componentInstance.alertHeader = 'Error'
        //   modalRef.componentInstance.mensaje='No se pudo liberar la Disponibilidad'
        // }
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
