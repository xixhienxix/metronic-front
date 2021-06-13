import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NgbActiveModal, NgbDateAdapter, NgbDateParserFormatter, NgbDateStruct,NgbDate, NgbCalendar, } from '@ng-bootstrap/ng-bootstrap';
import { of, Subscription } from 'rxjs';
import { catchError, finalize, first, tap } from 'rxjs/operators';
import { Huesped } from '../../../../_models/customer.model';
import { Foliador } from '../../../../_models/foliador.model';
import { HuespedService } from '../../../../_services';
import { CustomAdapter, CustomDateParserFormatter, getDateFromString } from '../../../../../../_metronic/core';
import { NgModule } from "@angular/core";
import { ReportesComponent } from '../../../../reportes.component'
import {Injectable}from '@angular/core'
import { FormsModule } from '@angular/forms';
import { HttpClient } from "@angular/common/http";
import {environment} from "../../../../../../../environments/environment"
import {map} from 'rxjs/operators'
import {FoliosService} from '../../../../_services/folios.service'
import { Observable } from 'rxjs';
import {MatSlideToggleModule} from '@angular/material/slide-toggle';
import {MatTabsModule} from '@angular/material/tabs';

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
  numeroCuarto:0
};




@Component({
  selector: 'app-edit-customer-modal',
  templateUrl: './edit-reserva-modal.component.html',
  styleUrls: ['./edit-reserva-modal.component.scss'],
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

export class EditReservaModalComponent implements OnInit {
  @Input()

  //DATETIMEPICKER RANGE
    hoveredDate: NgbDate | null = null;

    fromDate: NgbDate | null;
    toDate: NgbDate | null;
    noches:number;
    id:number;
    folio:number;
    isLoading$;
    model:NgbDateStruct;
    huesped: Huesped;
    foliador:Foliador;
    folioLetra:string;
    formGroup: FormGroup;
    public folios:Foliador[]=[];
    public folioactualizado:any;
    checked: boolean = true;
    modifica:boolean = true;
    changeStyleHidden:string = 'display:none'
    changeStyleVisible:string = ''
    setLabel:string="label label-lg label-light-primary label-inline"

    private subscriptions: Subscription[] = [];
    public listaFolios:Foliador[];


    constructor(
      //Date Imports
      private calendar: NgbCalendar,
      public formatter: NgbDateParserFormatter,

      //
      public foliosService : FoliosService,
      private customersService: HuespedService,
      private fb: FormBuilder, public modal: NgbActiveModal,
      public customerService: HuespedService,
      public postService : ReportesComponent,
      private http: HttpClient
      ) {
        this.fromDate = calendar.getToday();
        this.toDate = calendar.getNext(calendar.getToday(), 'd', 1); }



    ngOnInit(): void {
      this.isLoading$ = this.customersService.isLoading$;
      this.loadCustomer();

    }


    // async getPrice(currency: string): Promise<number> {
    //   const response = await this.http.get(this.currentPriceUrl).toPromise();
    //   return response.json().bpi[currency].rate;
    // }


    loadCustomer() {

      if (!this.folio) {
        console.log("Load Costumer !this.folio", this.folio)

        this.huesped = EMPTY_CUSTOMER;
        this.huesped.nombre=this.huesped.nombre;

        this.huesped.folio=this.folio;
        this.huesped.origen = "Online";
        this.loadForm();

      } else {


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
          this.setLabelStyle(this.huesped.estatus);
        });
        this.subscriptions.push(sb);
      }
    }

    loadForm() {

      this.formGroup = this.fb.group({
        nombre: [this.huesped.nombre, Validators.compose([Validators.required, Validators.minLength(3), Validators.maxLength(100)])],
        email: [this.huesped.email, Validators.compose([Validators.email,Validators.pattern("^[a-z0-9._%+-]+@[a-z0-9.-]+\\.[a-z]{2,4}$"),Validators.minLength(3),Validators.maxLength(50)])],
        telefono: [this.huesped.telefono, Validators.compose([Validators.nullValidator,Validators.minLength(10),Validators.maxLength(14)])],
        trabajaEn: [this.huesped.trabajaEn, Validators.compose([Validators.nullValidator,Validators.minLength(3),Validators.maxLength(100)])],
        fechaNacimiento: [this.huesped.fechaNacimiento, Validators.compose([Validators.nullValidator,Validators.minLength(3),Validators.maxLength(100)])],
        tipoDeID: [this.huesped.tipoDeID, Validators.compose([Validators.nullValidator,Validators.minLength(3),Validators.maxLength(100)])],
        numeroDeID: [this.huesped.numeroDeID, Validators.compose([Validators.nullValidator,Validators.minLength(3),Validators.maxLength(100)])],
        direccion: [this.huesped.direccion, Validators.compose([Validators.nullValidator,Validators.minLength(3),Validators.maxLength(100)])],
        pais: [this.huesped.pais, Validators.compose([Validators.nullValidator,Validators.minLength(3),Validators.maxLength(100)])],
        ciudad: [this.huesped.ciudad, Validators.compose([Validators.nullValidator,Validators.minLength(3),Validators.maxLength(100)])],
        codigoPostal: [this.huesped.codigoPostal, Validators.compose([Validators.nullValidator,Validators.minLength(3),Validators.maxLength(100)])],
        lenguaje: [this.huesped.lenguaje, Validators.compose([Validators.nullValidator,Validators.minLength(3),Validators.maxLength(100)])],
      });

      this.noches=-parseInt((this.huesped.llegada.toString()).split("/")[0])+parseInt((this.huesped.salida.toString()).split("/")[0])
      console.log("",(this.huesped.llegada.toString()).split("/")[0])
      console.log("",(this.huesped.llegada.toString()).split("/")[0])
      console.log("this.noches",this.noches)
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
        this.huesped.lenguaje,
        this.huesped.numeroCuarto
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

    changeVisible()
    {
      this.changeStyleHidden='';
      this.changeStyleVisible='display:none'
    }

    setEstatus(value): void {
      if(value==1){this.huesped.estatus=value; this.setLabelStyle(value)}//Huesped en Casa
      if(this.huesped.estatus==2){}//Reserva sin Pago
      if(this.huesped.estatus==3){}//Reserva Confirmada
      if(this.huesped.estatus==4){}//Check-Out
      if(this.huesped.estatus==5){}//Uso Interno
      if(this.huesped.estatus==6){}//Bloqueo / Sin llegada
      if(this.huesped.estatus==7){}//Reserva Temporal

      this.huesped.estatus = value;
      this.setLabelStyle(value)
  }

  setLabelStyle(id:number)
  {
    if(id==1){this.setLabel="color:#a6e390"}
    if(id==2){this.setLabel="color:#ffce54"}
    if(id==3){this.setLabel="color:#a8d5e5"}
    if(id==4){this.setLabel="color:fb7f8c"}
    if(id==5){this.setLabel="color:#d8b8f0"}
    if(id==6){this.setLabel="color:#e6e9ed"}
    if(id==7){this.setLabel="color:#fac3e2"}
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

    tarifaAutomatica()
    {
      if (!this.checked) {
        this.checked=true ;
       } else {
         this.checked=false ;
       }
    }
  }
