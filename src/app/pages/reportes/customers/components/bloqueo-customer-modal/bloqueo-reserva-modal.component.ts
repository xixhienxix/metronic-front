import {  Component, Input, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NgbActiveModal, NgbDateAdapter, NgbDateParserFormatter, NgbDateStruct,NgbDate, NgbCalendar,NgbDatepickerI18n, } from '@ng-bootstrap/ng-bootstrap';
import { from, of, Subscription } from 'rxjs';
import { catchError,  first,  tap } from 'rxjs/operators';
import { Huesped } from '../../../_models/customer.model';
import { Foliador } from '../../../_models/Foliador.model';
import { Estatus } from '../../../_models/estatus.model';
import { HuespedService } from '../../../_services';
import { EstatusService } from '../../../_services/estatus.service';
import { CustomAdapter, CustomDateParserFormatter } from '../../../../../_metronic/core';
import { ReportesComponent } from '../../../reportes.component'
import { HttpClient } from "@angular/common/http";
import { map} from 'rxjs/operators'
import { FoliosService} from '../../../_services/folios.service'
import { HabitacionesService} from '../../../_services/habitaciones.service'
import { Habitaciones } from '../../../_models/habitaciones.model';
import { DisponibilidadService } from '../../../_services/disponibilidad.service';
import { Disponibilidad } from '../../../_models/disponibilidad.model';
import { NgbModalConfig, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { debounceTime, distinctUntilChanged, elementAt } from 'rxjs/operators';
import { Observable} from  'rxjs';
import {MatDialog} from '@angular/material/dialog';
import {HistoricoService} from '../../../_services/historico.service'
import { ModalDismissReasons} from '@ng-bootstrap/ng-bootstrap';
import { BloqueoService } from '../../../_services/bloqueo.service'
import { Bloqueo } from '../../../_models/bloqueo.model';

let date: Date = new Date();
declare global {
  interface Date {
      getDays (start?: number) : [Date, Date]
  }
}



const EMPTY_CUSTOMER: Huesped = {
  id:undefined,
  folio:undefined,
  adultos:1,
  ninos:1,
  nombre: '',
  estatus: '',
  // llegada: date.getDay().toString()+'/'+date.getMonth()+'/'+date.getFullYear(),
  // salida: (date.getDay()+1).toString()+'/'+date.getMonth()+'/'+date.getFullYear(),
  llegada:'',
  salida:'',
  noches: 1,
  tarifa:500,
  porPagar: 500,
  pendiente:500,
  origen: 'Online',
  habitacion: '',
  telefono:"",
  email:"",
  motivo:"",
  //  OtrosDatos
  fechaNacimiento:'',
  trabajaEn:'',
  tipoDeID:'',
  numeroDeID:'',
  direccion:'',
  pais:'',
  ciudad:'',
  codigoPostal:'',
  lenguaje:'Español',
  numeroCuarto: 0
};


@Component({
  selector: 'app-edit-customer-modal',
  templateUrl: './bloqueo-reserva-modal.component.html',
  styleUrls: ['./bloqueo-reserva-modal.component.scss'],
  styles:[`


  .form-group.hidden {
    width: 0;
    margin: 0;
    border: none;
    padding: 0;
  }
  .custom-day {
    text-align: center;
    padding: 0.185rem 0.25rem;
    display: inline-block;
    height: 2rem;
    width: 2rem;
  }
  .custom-day.focused {
    background-color: #e6e6e6;
  }
  .custom-day.range, .custom-day:hover {
    background-color: rgb(2, 117, 216);
    color: white;
  }
  .custom-day.faded {
    background-color: rgba(2, 117, 216, 0.5);
  },


`],
  // NOTE: For this example we are only providing current component, but probably
  // NOTE: you will w  ant to provide your main App Module
  providers: [
    {provide: NgbDateAdapter, useClass: CustomAdapter},
    {provide: NgbDateParserFormatter, useClass: CustomDateParserFormatter}
  ]
})


export class BloqueoReservaModalComponent implements  OnInit, OnDestroy
{
  // @ViewChild('menuTrigger') menuTrigger: MatMenuTrigger;

  @Input()

//DATETIMEPICKER RANGE
  hoveredDate: NgbDate | null = null;

  fromDate: NgbDate | null;
  fromDate1: string;

  toDate: NgbDate | null;


  id:number;
  folio:number;
  isLoading$;
  model:NgbDateStruct;
  huesped: Huesped;
  habitaciones:Habitaciones;
  formGroup: FormGroup;
  myControl: FormGroup;
  public cuartos:Habitaciones[]=[];
  public codigoCuarto:Habitaciones[]=[];
  public infoCuarto:Habitaciones[]=[];
  public disponibilidad:Disponibilidad[]=[];
  public sinDisponibilidad:any[]=[]
  public estatusArray:Estatus[]=[];
  public folioactualizado:any;
  cuarto:string;
  private subscriptions: Subscription[] = [];
  public listaFolios:Foliador[];
  public listaBloqueos:Bloqueo[];
  displayNone:string = "display:none"
  showDropDown=false;
  accordionDisplay="";
  _isDisabled:boolean=true;




  constructor(
    //Date Imports
    private modalService: NgbModal,
    private calendar: NgbCalendar,
    public formatter: NgbDateParserFormatter,
    public habitacionService : HabitacionesService,
    private fb: FormBuilder, public modal: NgbActiveModal,
    public estatusService: EstatusService,
    public bloqueoService: BloqueoService,
    public postService : ReportesComponent,
    private http: HttpClient,
    public i18n: NgbDatepickerI18n
    ) {
      this.fromDate = calendar.getToday();
      this.toDate = calendar.getNext(calendar.getToday(), 'd', 1);
    }



  ngOnInit(): void {
    this.getCodigosCuarto();
    this.getHabitaciones();
    this.getEstatus();
    this.getBloqueos();
  }


  getHabitaciones()
  {
    this.habitacionService.gethabitaciones()
    .subscribe((infoCuartos)=>{
      this.infoCuarto=infoCuartos
    })

  }

  getCodigosCuarto()
  {
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
        console.log("distinct Codigos de cuarto",this.codigoCuarto)
      })
  }

  getEstatus()
   {
    this.estatusService.getEstatus()
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
                        .subscribe((estatus)=>{
                          for(let i=0;i<estatus.length;i++)
                          {
                            this.estatusArray=estatus
                          }
                        })

  }

  getBloqueos()
  {
    this.bloqueoService.getBloqueos()
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
      .subscribe((bloqueos)=>{
        this.listaBloqueos=(bloqueos)
        console.log("Lista de Bloqueos: ",this.listaBloqueos)
      })
  }


  // loadForm() {

  //   this.formGroup = this.fb.group({
  //     cuarto:[this.huesped.llegada, Validators.compose([Validators.required])],
  //     habitacion:[this.huesped.llegada, Validators.compose([Validators.required])]
  //   });
  // }



  save() {
  this.postBloqueo();
  }



  private postBloqueo() {

    const formData = this.formGroup.value;

    this.huesped.llegada = this.fromDate.toString();
    this.huesped.salida = this.toDate.toString();
    this.huesped.nombre = formData.nombre;

        this.huesped.llegada=this.fromDate.day+'/'+this.fromDate.month+'/'+this.fromDate.year
        this.huesped.salida=this.toDate.day+'/'+this.toDate.month+'/'+this.toDate.year
        this.huesped.noches=(this.toDate.day)-(this.fromDate.day)
        this.huesped.porPagar=this.huesped.tarifa*this.huesped.noches
        this.huesped.pendiente=this.huesped.tarifa*this.huesped.noches
        this.huesped.habitacion=formData.habitacion
        this.huesped.telefono=formData.telefono
        this.huesped.email=formData.email
        this.huesped.motivo=formData.motivo
        this.huesped.id=this.huesped.folio
        this.huesped.numeroCuarto=0
        this.huesped.habitacion=this.cuarto
  let post = this.postService.addPost
    (
      this.huesped.id,
      this.huesped.folio,
      this.huesped.adultos,
      this.huesped.ninos,
      this.huesped.nombre,
      this.huesped.estatus,
      this.huesped.llegada,
      this.huesped.salida,
      this.huesped.noches,
      this.huesped.tarifa,
      this.huesped.pendiente,
      this.huesped.porPagar,
      this.huesped.origen,
      this.huesped.habitacion,
      this.huesped.telefono,
      this.huesped.email,
      this.huesped.motivo,
      this.huesped.fechaNacimiento,
      this.huesped.trabajaEn,
      this.huesped.tipoDeID,
      this.huesped.numeroDeID,
      this.huesped.direccion,
      this.huesped.pais,
      this.huesped.ciudad,
      this.huesped.codigoPostal,
      this.huesped.lenguaje,
      this.huesped.numeroCuarto
    );

      this.modal.close();

  }





  ngOnDestroy(): void {
    this.subscriptions.forEach(sb => sb.unsubscribe());
  }

  // helpers for View
  isControlValid(controlName: string): boolean {
    const control = this.formGroup.controls[controlName];
    return control.valid && (control.dirty || control.touched);
  }

  isControlInvalid(controlName: string): boolean {
    const control = this.formGroup.controls[controlName];
    return control.invalid && (control.dirty || control.touched);
  }

  controlHasError(validation, controlName): boolean {
    const control = this.formGroup.controls[controlName];
    return control.hasError(validation) && (control.dirty || control.touched);
  }

  isControlTouched(controlName): boolean {
    const control = this.formGroup.controls[controlName];
    return control.dirty || control.touched;
  }






  habValue($event)
  {

    if($event.target.options.selectedIndex==1)
    {
        this.cuarto=""
        this.habitacionService.gethabitaciones()
          .subscribe((cuartos)=>{
            this.infoCuarto=(cuartos)
          })
    }else
    {
      this.cuarto = $event.target.options[$event.target.options.selectedIndex].text.replace(" ","_");
      console.log("this.cuarto",this.cuarto)
      this.infoCuarto = []

      this.habitacionService.getHabitacionesbyTipo(this.cuarto)
      .subscribe((listado)=>{
        this.infoCuarto=listado;
      })

    }
  }


  numCuartos($event)
  {
    this.accordionDisplay="display:none"
    this.disponibilidad=[]
    this.cuartos=[]
    this.sinDisponibilidad=[]

    if($event.target.options.selectedIndex==1)
    {
        this.cuarto=""
        this.habitacionService.gethabitaciones()
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
          .subscribe((cuartos)=>{
            this.cuartos=(cuartos)
            console.log("buscaDispo this.cuartos",this.cuartos)
          })
    }else
    {
      this.cuarto = $event.target.options[$event.target.options.selectedIndex].text.replace(" ","_");
      console.log("this.cuarto",this.cuarto)
    }
  }

  isNumber(val): boolean { return typeof val === 'number'; }
  isNotNumber(val): boolean { return typeof val !== 'number'; }




//Date Helpers
  onDateSelection(date: NgbDate) {
    if (!this.fromDate && !this.toDate) {
      this.fromDate = date;
    } else if (this.fromDate && !this.toDate && date && date.after(this.fromDate)) {
      this.toDate = date;
    } else {
      this.toDate = null;
      this.fromDate = date;
    }
  }

  isHovered(date: NgbDate) {
    return this.fromDate && !this.toDate && this.hoveredDate && date.after(this.fromDate) && date.before(this.hoveredDate);
  }

  isInside(date: NgbDate) {
    return this.toDate && date.after(this.fromDate) && date.before(this.toDate);
  }

  isRange(date: NgbDate) {
    return date.equals(this.fromDate) || (this.toDate && date.equals(this.toDate)) || this.isInside(date) || this.isHovered(date);
  }

  validateInput(currentValue: NgbDate | null, input: string): NgbDate | null {
    const parsed = this.formatter.parse(input);
    return parsed && this.calendar.isValid(NgbDate.from(parsed)) ? NgbDate.from(parsed) : currentValue;

  }

  rangoFechas(llegada:string,salida:string)
  {
    let rangodeFechas
    let toDate =   new Date(parseInt(salida.split("/")[2]), parseInt(salida.split("/")[0]), parseInt(salida.split("/")[1]));
    let fromDate = new Date(parseInt(llegada.split("/")[2]), parseInt(llegada.split("/")[0]), parseInt(llegada.split("/")[1]));
    let diaDif = Math.floor((Date.UTC(toDate.getFullYear(), toDate.getMonth(), toDate.getDate()) - Date.UTC(fromDate.getFullYear(), fromDate.getMonth(), fromDate.getDate()) ) / (1000 * 60 * 60 * 24));

    rangodeFechas = llegada.split("/")[1]+"/"+this.i18n.getMonthShortName(parseInt(llegada.split("/")[0]))+"/"+llegada.split("/")[2]+" - " +salida.split("/")[1]+"/"+this.i18n.getMonthShortName(parseInt(salida.split("/")[0]))+"/"+salida.split("/")[2]

    return rangodeFechas
  }



  private getDismissReason(reason: any): string {
      if (reason === ModalDismissReasons.ESC) {
          return 'by pressing ESC';
      } else if (reason === ModalDismissReasons.BACKDROP_CLICK) {
          return 'by clicking on a backdrop';
      } else {
          return  `with: ${reason}`;
      }
  }

  }


