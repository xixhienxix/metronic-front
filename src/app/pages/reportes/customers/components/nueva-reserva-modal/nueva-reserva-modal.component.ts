import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NgbActiveModal, NgbDateAdapter, NgbDateParserFormatter, NgbDateStruct,NgbDate, NgbCalendar, } from '@ng-bootstrap/ng-bootstrap';
import { of, Subscription } from 'rxjs';
import { catchError, finalize, first, tap } from 'rxjs/operators';
import { Huesped } from '../../../_models/customer.model';
import { Foliador } from '../../../_models/Foliador.model';
import { HuespedService } from '../../../_services';
import { CustomAdapter, CustomDateParserFormatter, getDateFromString } from '../../../../../_metronic/core';
import { NgModule } from "@angular/core";
import { ReportesComponent } from '../../../reportes.component'
import {Injectable}from '@angular/core'
import { FormsModule } from '@angular/forms';
import { HttpClient } from "@angular/common/http";
import {environment} from "../../../../../../environments/environment"
import {map} from 'rxjs/operators'
import {FoliosService} from '../../../_services/folios.service'
import {HabitacionesService} from '../../../_services/habitaciones.service'
import { Observable } from 'rxjs';
import { Habitaciones } from '../../../_models/habitaciones.model';


let date: Date = new Date();

const EMPTY_CUSTOMER: Huesped = {
  id:undefined,
  folio:undefined,
  adultos:1,
  ninos:1,
  nombre: '',
  estatus: 1,
  // llegada: date.getDay().toString()+'/'+date.getMonth()+'/'+date.getFullYear(),
  // salida: (date.getDay()+1).toString()+'/'+date.getMonth()+'/'+date.getFullYear(),
  llegada:'',
  salida:'',
  noches: 1,
  tarifa:500,
  porPagar: 500,
  pendiente:500,
  origen: 'Online',
  habitacion: 0,
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
  lenguaje:'Español'

};




@Component({
  selector: 'app-edit-customer-modal',
  templateUrl: './nueva-reserva-modal.component.html',
  styleUrls: ['./nueva-reserva-modal.component.scss'],
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
  }
`],
  // NOTE: For this example we are only providing current component, but probably
  // NOTE: you will w  ant to provide your main App Module
  providers: [
    {provide: NgbDateAdapter, useClass: CustomAdapter},
    {provide: NgbDateParserFormatter, useClass: CustomDateParserFormatter}
  ]
})


export class NuevaReservaModalComponent implements OnInit, OnDestroy {
  @Input()

//DATETIMEPICKER RANGE
  hoveredDate: NgbDate | null = null;

  fromDate: NgbDate | null;
  fromDate1: string;

  toDate: NgbDate | null;
//
  id:number;
  folio:number;
  isLoading$;
  model:NgbDateStruct;
  huesped: Huesped;
  foliador:Foliador;
  habitaciones:Habitaciones;
  folioLetra:string;
  formGroup: FormGroup;
  preAsig:number;
  public folios:Foliador[]=[];
  public cuartos:Habitaciones[]=[];
  public codigoCuarto:Habitaciones[]=[];
  public folioactualizado:any;
  cuarto:string;
  private subscriptions: Subscription[] = [];
  public listaFolios:Foliador[];


  constructor(
    //Date Imports
    private calendar: NgbCalendar,
    public formatter: NgbDateParserFormatter,
    public habitacionService : HabitacionesService,
    public foliosService : FoliosService,
    private customersService: HuespedService,
    private fb: FormBuilder, public modal: NgbActiveModal,
    public customerService: HuespedService,
    public postService : ReportesComponent,
    private http: HttpClient
    ) {
      this.fromDate = calendar.getToday();
      this.toDate = calendar.getNext(calendar.getToday(), 'd', 1);
    }



  ngOnInit(): void {
    this.isLoading$ = this.customersService.isLoading$;
    this.loadCustomer();
    this.getDispo();
  }


  loadCustomer() {

    if (!this.id) {
      console.log("Load Costumer !this.folio", this.folio)

      this.huesped = EMPTY_CUSTOMER;
      this.huesped.folio=this.folio;
      this.huesped.origen = "Online";
      this.loadForm();

    } else {
      console.log("Load Costumer else this.folio", this.folio)
      console.log("Load Costumer else this.id", this.id)

      const sb = this.customersService.getItemById(this.folio).pipe(
        first(),
        catchError((errorMessage) => {
          console.log("ERROR MESSAGE PIPE DESPUES DEL GETELEMETN BY ID",errorMessage)
          this.modal.dismiss(errorMessage);
          return of(EMPTY_CUSTOMER);
        })
      ).subscribe((huesped1: Huesped) => {
        this.huesped = huesped1;
        this.loadForm();
      });
      this.subscriptions.push(sb);
    }
  }

  loadForm() {

    this.formGroup = this.fb.group({
      nombre: [this.huesped.nombre, Validators.compose([Validators.required, Validators.minLength(3), Validators.maxLength(100)])],
      email: [this.huesped.email, Validators.compose([Validators.email,Validators.pattern("^[a-z0-9._%+-]+@[a-z0-9.-]+\\.[a-z]{2,4}$"),Validators.minLength(3),Validators.maxLength(50)])],
      telefono: [this.huesped.telefono, Validators.compose([Validators.nullValidator,Validators.minLength(10),Validators.maxLength(14)])],
      salida:[this.huesped.salida, Validators.compose([Validators.required])],
      llegada:[this.huesped.llegada, Validators.compose([Validators.required])],
      adultos:[this.huesped.adultos, Validators.compose([Validators.required])],
      ninos:[this.huesped.ninos, Validators.compose([Validators.required])],
      habitacion:[this.huesped.habitacion, Validators.compose([Validators.required])],
      // tarifa:[this.huesped.tarifa, Validators.compose([Validators.required])]

    });

  }


  save() {
    this.prepareHuesped();
  this.create();
  }

  edit() {
    const sbUpdate = this.customersService.update(this.huesped).pipe(
      tap(() => {
        this.modal.close();
      }),
      catchError((errorMessage) => {
        this.modal.dismiss(errorMessage);
        return of(this.huesped);
      }),
    ).subscribe(res => this.huesped = res);
    this.subscriptions.push(sbUpdate);
  }

  create() {
    const sbCreate = this.customersService.create(this.huesped).pipe(
      tap(() => {
        this.modal.close();
      }),
      catchError((errorMessage) => {
        this.modal.dismiss(errorMessage);
        return of(this.huesped);
      }),
    ).subscribe((res: Huesped) => this.huesped = res);
    this.subscriptions.push(sbCreate);
  }

  private prepareHuesped() {

    const formData = this.formGroup.value;


    this.huesped.llegada = this.fromDate.toString();
    this.huesped.salida = this.toDate.toString();
    this.huesped.nombre = formData.nombre;

        this.huesped.llegada=this.fromDate.day+'/'+this.fromDate.month+'/'+this.fromDate.year
        this.huesped.salida=this.toDate.day+'/'+this.toDate.month+'/'+this.toDate.year
        this.huesped.noches=(this.fromDate.day)-(this.toDate.day)
        this.huesped.porPagar=this.huesped.tarifa*this.huesped.noches
        this.huesped.pendiente=this.huesped.tarifa*this.huesped.noches
        this.huesped.habitacion=formData.habitacion
        this.huesped.telefono=formData.telefono
        this.huesped.email=formData.email
        this.huesped.motivo=formData.motivo
        this.huesped.id=this.huesped.folio
    this.postService.addPost
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
      this.huesped.lenguaje
    );
      console.log("AddPost Succesfull")


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

  emailValidator(event:Event){

  }

  getDispo()
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


  buscaDispo()
  {
    this.habitacionService.getHabitacionesbyTipo(this.cuarto)
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
  }

  preAsignar(cuarto:number)
  {
    this.preAsig=cuarto;
  }

  habValue($event)
  {
    this.cuarto = $event.target.options[$event.target.options.selectedIndex].text;
    // this.cuarto = this.cuarto.split(" ")[0]
    console.log("this.cuarto",this.cuarto)
  }

  isNumber(val): boolean { return typeof val === 'number'; }
  isNotNumber(val): boolean { return typeof val !== 'number'; }


  quantity:number=1;
  quantityNin:number=1;

  plus()
  {
    this.quantity++;
    this.huesped.adultos=this.quantity
  }
  minus()
  {
    if(this.quantity>1)
    {
    this.quantity--;
    this.huesped.adultos=this.quantity;
    }
    else
    this.quantity
    this.huesped.adultos=this.quantity;
  }
  plusNin()
  {
    this.quantityNin++;
    this.huesped.ninos=this.quantityNin;
  }
  minusNin()
  {
    if(this.quantityNin>1)
    {
    this.quantityNin--;
    this.huesped.ninos=this.quantityNin;
    }
    else
    this.quantityNin
    this.huesped.ninos=this.quantityNin;

  }



  setEstatus(value): void {
    this.huesped.estatus = value;
}


  onSelectHuesped(event : string)
  {
    console.log(event);
    this.huesped.nombre=event;

  }



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


}
