import { Component, Input, OnDestroy, OnInit,ViewEncapsulation } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NgbActiveModal, NgbDateAdapter, NgbDateParserFormatter, NgbDateStruct,NgbDate, NgbCalendar,NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { of, Subscription } from 'rxjs';
import { catchError, finalize, first, tap } from 'rxjs/operators';
import { Huesped } from '../../../../_models/customer.model';
import { Foliador } from '../../../../_models/foliador.model';
import { Estatus } from '../../../../_models/estatus.model';
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
import {EstatusService} from '../../../../_services/estatus.service'
import { Observable } from 'rxjs';
import {MatSlideToggleModule} from '@angular/material/slide-toggle';
import {MatTabsModule} from '@angular/material/tabs';
import{ConfirmationModalComponent} from '../../helpers/confirmation-modal/confirmation-modal/confirmation-modal.component'
import {NgbDatepickerI18n, } from '@ng-bootstrap/ng-bootstrap';

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
  selector: 'app-edit-customer-modal',
  templateUrl: './edit-reserva-modal.component.html',
  styleUrls: ['./edit-reserva-modal.component.scss'],
  encapsulation: ViewEncapsulation.None,
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
    fullFechaSalida:string
    fullFechaLlegada:string
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
    estatusArray:Estatus[]=[];
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
      private modalService: NgbModal,
      //
      public foliosService : FoliosService,
      private customersService: HuespedService,
      private fb: FormBuilder, public modal: NgbActiveModal,
      public customerService: HuespedService,
      public postService : ReportesComponent,
      public estatusService : EstatusService,
      public i18n: NgbDatepickerI18n,
      private http: HttpClient
      ) {
        this.fromDate = calendar.getToday();
        this.toDate = calendar.getNext(calendar.getToday(), 'd', 1); }



    ngOnInit(): void {
      this.isLoading$ = this.customersService.isLoading$;
      this.loadCustomer();
      this.getEstatus();
    }


    // async getPrice(currency: string): Promise<number> {
    //   const response = await this.http.get(this.currentPriceUrl).toPromise();
    //   return response.json().bpi[currency].rate;
    // }

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
    getEstatus(): void {
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
          this.formatFechas();

          // this.setLabelStyle(this.huesped.estatus);
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

      this.customerService.addPost(this.huesped);
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

      for (let i=0;i<this.estatusArray.length;i++)
      {
        if(value==this.estatusArray[i].id)
        {
          this.huesped.estatus = this.estatusArray[i].estatus
          this.setLabel= this.estatusArray[i].color
        }
      }
  }

  backgroundColor(estatus:string)
  {
    let color;

    for (let i=0;i<this.estatusArray.length;i++)
    {
      if(estatus==this.estatusArray[i].estatus)
      {
        color = this.estatusArray[i].color
      }
    }
    return color;
  }
  openDialog(huesped:Huesped) {
    const modalRef = this.modalService.open(ConfirmationModalComponent,
      {
        scrollable: true,
        windowClass: 'myCustomModalClass',
        // keyboard: false,
        // backdrop: 'static'
        // backdrop: If `true`, the backdrop element will be created for a given modal. Alternatively, specify `’static’` for a backdrop that doesn’t close the modal on click. The default value is `true`.
        // beforeDismiss: Callback right before the modal will be dismissed.
        // centered: If `true`, the modal will be centered vertically. The default value is `false`.
        // container: A selector specifying the element all-new modal windows should be appended to. If not specified, it will be `body`.
        // keyboard: If `true`, the modal will be closed when the `Escape` key is pressed. The default value is `true`.
        // scrollable: Scrollable modal content (false by default).
        // size: Size of a new modal window. ‘sm’ | ‘lg’ | ‘xl’ | string;
        // windowClass: A custom class to append to the modal window.
        // backdropClass: A custom class to append to the modal backdrop.
        // Using componetInstance we can pass data object to modal contents.
      });
  
  
    modalRef.componentInstance.huesped = huesped;
    modalRef.result.then((result) => {
      console.log(result);
    }, (reason) => {
    });
    }
  
  // setLabelStyle(id:number)
  // {
  //   if(id==1){this.setLabel="color:#a6e390"}
  //   if(id==2){this.setLabel="color:#ffce54"}
  //   if(id==3){this.setLabel="color:#a8d5e5"}
  //   if(id==4){this.setLabel="color:fb7f8c"}
  //   if(id==5){this.setLabel="color:#d8b8f0"}
  //   if(id==6){this.setLabel="color:#e6e9ed"}
  //   if(id==7){this.setLabel="color:#fac3e2"}
  // }

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
    closeModal(){
      this.modal.close();
    }

  }
