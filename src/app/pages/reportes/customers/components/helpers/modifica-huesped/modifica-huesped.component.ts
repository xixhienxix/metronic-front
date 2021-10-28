import { Component, OnInit, ViewChild, EventEmitter,Output } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
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
import { AlertsComponent } from '../alerts-component/alerts/alerts.component';


@Component({
  selector: 'app-modifica-huesped',
  templateUrl: './modifica-huesped.component.html',
  styleUrls: ['./modifica-huesped.component.scss']
})
export class ModificaHuespedComponent implements OnInit {
  @Output() passEntry: EventEmitter<any> = new EventEmitter();

  @ViewChild('matSelect') matSelect = null;

  huesped:Huesped;
  huespedAnterior:any;
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

  fromDate: Date | null;
  today: NgbDate | null;
  comparadorInicial:Date;
  display:boolean=true;
  comparadorFinal:Date
  toDate: Date | null;
  minDate:{year:number,month:number,day:number}
  //Disponibilidad

  cuarto:string;
  numCuartoNumber:number;
  tarifa:number;
  codigoCuartoString:string;
  codigo:any[]=[]

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
    private customerService: HuespedService,
    public i18n: NgbDatepickerI18n,
    public disponibilidadService: DisponibilidadService,
    public habitacionService:HabitacionesService,
    public fb: FormBuilder,
    private calendar: NgbCalendar,

  ) { 
    const current = new Date();
    this.minDate = {year:current.getUTCFullYear(),month:current.getUTCMonth()+1,day:current.getUTCDate()}
    this.today= calendar.getToday();

    // this.fromDate = calendar.getToday();
    // this.toDate = calendar.getNext(calendar.getToday(), 'd', 1);
  }

  ngOnInit(): void {
    this.fromDate = new Date(parseInt(this.huesped.llegada.split("/")[2]), parseInt(this.huesped.llegada.split("/")[1])-1, parseInt(this.huesped.llegada.split("/")[0]));
    this.toDate = new Date(parseInt(this.huesped.salida.split("/")[2]), parseInt(this.huesped.salida.split("/")[1])-1, parseInt(this.huesped.salida.split("/")[0]));
    this.formatFechas();
    this.loadForm();
    this.getCodigosCuarto();
    this.getHabitaciones();
    this.inicio=true;
  }

  getHabitaciones()
  {
    this.habitacionService.gethabitaciones()
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


   
  }

  getCodigosCuarto()
  {
    this.codigoCuarto=[]
    this.habitacionService.getCodigohabitaciones()
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
  }

  loadForm() {

    // this.modificaHuespedFormGroup = this.fb.group({
    //   'tipoCuarto': [ undefined, Validators.required ],
    //   'numeroHab' : [undefined,Validators.required],

    // });
    this.huespedAnterior = {
      Habitacion:this.huesped.habitacion,
      Cuarto:this.huesped.numeroCuarto,
      Llegada:this.huesped.llegada,
      Salida:this.huesped.salida
    }

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
    const fechaLlegada = new Date(anoLlegada,mesLlegada,diaLlegada)
    this.fullFechaLlegada = fechaLlegada.getUTCDate().toString() + "/" + this.i18n.getMonthShortName(fechaLlegada.getUTCMonth()) + "/" + fechaLlegada.getFullYear().toString()

    const diaSalida = parseInt(this.huesped.salida.split("/")[0])
    const mesSalida = parseInt(this.huesped.salida.split("/")[1])
    const anoSalida = parseInt(this.huesped.salida.split("/")[2])
    const fechaSalida = new Date(anoSalida,mesSalida,diaSalida)
    this.fullFechaSalida = fechaSalida.getUTCDate().toString() + "/" + this.i18n.getMonthShortName(fechaSalida.getUTCMonth()) + "/" + fechaSalida.getFullYear().toString()
  }

  fechaSeleccionadaInicial(event:NgbDate){
    this.accordionDisplay="display:none";

    this.fromDate = new Date(event.year,event.month-1,event.day) 

    this.huesped.llegada=event.day+"/"+event.month+"/"+event.year

    this.comparadorInicial = new Date(event.year,event.month-1,event.day)
  
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

    this.toDate = new Date(event.year,event.month-1,event.day) 

    this.huesped.salida=event.day+"/"+event.month+"/"+event.year

    this.comparadorFinal = new Date(event.year,event.month-1,event.day)
  
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
    // let toDate =   new Date(this.toDate.year, this.toDate.month - 1, this.toDate.day);
    // let fromDate = new Date(this.fromDate.year, this.fromDate.month - 1, this.fromDate.day);
    var Difference_In_Time=this.toDate.getTime()-this.fromDate.getTime()
    var Difference_In_Days = Difference_In_Time / (1000 * 3600 * 24);
    this.diaDif=Math.floor(Difference_In_Days)
    // this.diaDif = Math.floor((Date.UTC(this.toDate.getFullYear(), this.toDate.getMonth(), this.toDate.getDate()) - Date.UTC(this.fromDate.getFullYear(), this.fromDate.getMonth(), this.fromDate.getDate()) ) / (1000 * 60 * 60 * 24));

  }

  habValue(codigoHabitacion:string)
  {
    this.expandedPane=true;
    this.inicio=false;
    this.cuarto=codigoHabitacion;
    this.sinDisponibilidad=[];
    this.accordionDisplay="";
    //  let toDate =   new Date(this.toDate.year, this.toDate.month - 1, this.toDate.day);
    //  let fromDate = new Date(this.fromDate.year, this.fromDate.month - 1, this.fromDate.day);
    // let diaDif = Math.floor((Date.UTC(toDate.getFullYear(), toDate.getMonth(), toDate.getDate()) - Date.UTC(fromDate.getFullYear(), fromDate.getMonth(), fromDate.getDate()) ) / (1000 * 60 * 60 * 24))



    if(codigoHabitacion=='1')
    {
          this.bandera=true
          // this.bandera=false;
            for (let i=0; i<this.diaDif; i++) 
            {
            this.disponibilidadService.getdisponibilidadTodos(this.fromDate.getDate(), this.fromDate.getMonth()+1, this.fromDate.getFullYear())
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
                    this.sinDisponibilidad.push(disponibles[i].Habitacion)
                  }
                  this.mySet.add(this.disponibilidad[i].Habitacion)
                }
                for(i=0;i<this.sinDisponibilidad.length;i++)
                {
                  this.mySet.delete(this.sinDisponibilidad[i])
                }
                console.log("mySEt Todos los Cuartos", this.mySet)
              })
              this.fromDate.setDate(this.fromDate.getDate() + 1);
            };
        // })
    }

    else
    {
      this.bandera=false;
      for (let i=0; i<this.diaDif; i++) {

      this.disponibilidadService.getdisponibilidad(this.fromDate.getDate(), this.fromDate.getMonth()+1, this.fromDate.getFullYear(),this.cuarto)
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
              this.sinDisponibilidad.push(disponibles[i].Habitacion)
            }
             this.mySet.add(this.disponibilidad[i].Habitacion)
          }
          for(i=0;i<this.sinDisponibilidad.length;i++)
          {
            this.mySet.delete(this.sinDisponibilidad[i])
          }

          console.log("mySet x tipo",this.mySet)
        })
        this.fromDate.setDate(this.fromDate.getDate() + 1);
      };
    }
  }

  // checkedUp(event,index:number,codigo:string){
  //   for(let i=0; i<this.cuartos.length;i++)
  //   {
  //     if(event.checked)
  //     {
  //       if(this.cuartos[i].Codigo==codigo)
  //       {
  //         if(this.cuartos[i].Numero!=index)
  //         {
  //           this.cuartos[i].checkBox=false
  //         }
  //       }
  //     }

  //   }
  // }
  cuartoValue(selected:boolean,value:any)
  {
    let index;
    let indexTipo;
    ;

    this.habitacionService.getHabitacionbyNumero(value)
      .subscribe((cuartos)=>{
        this.codigo=(cuartos)
      })

  }

  closeModal(){
    this.modal.close();
  }





    habitacionSeleccionada(cuarto:number,codigo:string,tarifa:number){
      this.numCuartoNumber=cuarto;
      this.codigoCuartoString=codigo;
      this.tarifa=tarifa;
    }

    revisaDatos(){
      if(this.numCuartoNumber==undefined||this.codigoCuartoString==undefined)
      {
        const modalRef = this.modalService.open(AlertsComponent,{size:'sm'})
        modalRef.componentInstance.alertHeader='Error'
        modalRef.componentInstance.mensaje='Debes seleccionar una habitacion antes de guardar los cambios'
        modalRef.result.then((result) => {
          this.closeResult = `Closed with: ${result}`;
          }, (reason) => {
              this.closeResult = `Dismissed ${this.getDismissReason(reason)}`;
          });
          setTimeout(() => {
            modalRef.close('Close click');
          },4000)
      }else 
      {
        this.actualizarDatos();
      }
    }
    actualizarDatos(){

    this.huesped.noches=this.diaDif

    this.huesped.tarifa=this.tarifa
   
    this.huesped.habitacion=this.codigoCuartoString
    this.huesped.numeroCuarto=this.numCuartoNumber,
    this.huesped.pendiente=this.huesped.tarifa*this.diaDif
    this.huesped.porPagar=this.huesped.tarifa*this.diaDif

    console.log(this.huesped.pendiente)
    console.log(this.huesped.porPagar)
    console.log(this.huesped.noches)

      this.customerService.updateHuesped(this.huesped).subscribe(
        ()=>{},
        (err)=>{
          if(err)
          {
            const modalRef=this.modalService.open(AlertsComponent,{size:'sm'})
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

        },
        ()=>{
          //
          this.customerService.updateHuespedModifica(this.huespedAnterior).subscribe(
            (err)=>{
              if(err)
              {
                const modalRef=this.modalService.open(AlertsComponent,{size:'sm'})
                modalRef.componentInstance.alertHeader = 'Error'
                modalRef.componentInstance.mensaje='No se pudo liberar la Disponibilidad'
              }
            },
            (value)=>{
              const modalRef=this.modalService.open(AlertsComponent,{size:'sm'})
              modalRef.componentInstance.alertHeader = 'Exito'
              modalRef.componentInstance.mensaje='Disponibilidad liberada con exito'
            }
            )
            

          this.passEntry.emit(this.huesped);
          this.customerService.setCurrentHuespedValue=this.huesped

          const modalRef=this.modalService.open(AlertsComponent,{size:'sm'})
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
        }
        )
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
     if(this.fechaFinalDisplay==true) {this.fechaFinalDisplay=false}
     else if(this.fechaFinalDisplay==false){this.fechaFinalDisplay=true}
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
