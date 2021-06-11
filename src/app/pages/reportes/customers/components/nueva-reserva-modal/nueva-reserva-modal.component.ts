import {  Component, Input, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NgbActiveModal, NgbDateAdapter, NgbDateParserFormatter, NgbDateStruct,NgbDate, NgbCalendar,NgbDatepickerI18n, } from '@ng-bootstrap/ng-bootstrap';
import { from, of, Subscription } from 'rxjs';
import { catchError,  first,  tap } from 'rxjs/operators';
import { Huesped } from '../../../_models/customer.model';
import { Foliador } from '../../../_models/Foliador.model';
import { HuespedService } from '../../../_services';
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
import {MatMenuTrigger} from '@angular/material/menu';
import { DialogComponent } from './components/dialog/dialog.component';
import {HistoricoService} from '../../../_services/historico.service'

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
  },


`],
  // NOTE: For this example we are only providing current component, but probably
  // NOTE: you will w  ant to provide your main App Module
  providers: [
    {provide: NgbDateAdapter, useClass: CustomAdapter},
    {provide: NgbDateParserFormatter, useClass: CustomDateParserFormatter}
  ]
})


export class NuevaReservaModalComponent implements  OnInit, OnDestroy
{
  @ViewChild('menuTrigger') menuTrigger: MatMenuTrigger;

  @Input()

//DATETIMEPICKER RANGE
  hoveredDate: NgbDate | null = null;

  fromDate: NgbDate | null;
  fromDate1: string;
  ToDoListForm:any;

  toDate: NgbDate | null;
//
options: string[] = ['One', 'Two', 'Three'];
filteredOptions: Observable<string[]>;
public dialog: MatDialog
  private modalService: NgbModal
  searchGroup: FormGroup;
  mySet = new Set();
  maxAdultos:number=6;
  maxNinos:number=6;
  bandera:boolean=false;
  inicio : boolean = true;
  id:number;
  folio:number;
  isLoading$;
  model:NgbDateStruct;
  huesped: Huesped;
  foliador:Foliador;
  habitaciones:Habitaciones;
  folioLetra:string;
  formGroup: FormGroup;
  myControl: FormGroup;
  preAsig:number;
  public folios:Foliador[]=[];
  public cuartos:Habitaciones[]=[];
  public codigoCuarto:Habitaciones[]=[];
  public infoCuarto:Habitaciones[]=[];
  public disponibilidad:Disponibilidad[]=[];
  public sinDisponibilidad:any[]=[]
  public folioactualizado:any;
  cuarto:string;
  private subscriptions: Subscription[] = [];
  public listaFolios:Foliador[];
  displayNone:string = "display:none"
  showDropDown=false;
  accordionDisplay="";
  _isDisabled:boolean=true;




  constructor(
    //Date Imports
    private calendar: NgbCalendar,
    public formatter: NgbDateParserFormatter,
    public habitacionService : HabitacionesService,
    public foliosService : FoliosService,
    private customersService: HuespedService,
    public historicoService: HistoricoService,
    private disponibilidadService:DisponibilidadService,
    private fb: FormBuilder, public modal: NgbActiveModal,
    public customerService: HuespedService,
    public postService : ReportesComponent,
    private http: HttpClient,
    public i18n: NgbDatepickerI18n
    ) {
      this.fromDate = calendar.getToday();
      this.toDate = calendar.getNext(calendar.getToday(), 'd', 1);
    }



  ngOnInit(): void {
    this.isLoading$ = this.customersService.isLoading$;
    this.historicoService.fetch();
    this.loadCustomer();
    this.getDispo();
    this.getHabitaciones();
  }


  loadCustomer() {

    if (!this.id) {

      this.huesped = EMPTY_CUSTOMER;
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
      });
      this.subscriptions.push(sb);
    }
  }

  loadForm() {

    this.formGroup = this.fb.group({
      nombre: [this.huesped.nombre, Validators.compose([Validators.required, Validators.minLength(3), Validators.maxLength(100)])],
      email: [this.huesped.email, Validators.compose([Validators.email,Validators.pattern("^[a-z0-9._%+-]+@[a-z0-9.-]+\\.[a-z]{2,4}$"),Validators.minLength(3),Validators.maxLength(50)])],
      telefono: [this.huesped.telefono, Validators.compose([Validators.nullValidator,Validators.pattern('(([+][(]?[0-9]{1,3}[)]?)|([(]?[0-9]{4}[)]?))\s*[)]?[-\s\.]?[(]?[0-9]{1,3}[)]?([-\s\.]?[0-9]{3})([-\s\.]?[0-9]{3,4})'),Validators.minLength(12),Validators.maxLength(14)])],
      salida:[this.huesped.salida, Validators.compose([Validators.required])],
      llegada:[this.huesped.llegada, Validators.compose([Validators.required])],
      adultos:[this.huesped.adultos, Validators.compose([Validators.required,Validators.max(this.maxAdultos)])],
      ninos:[this.huesped.ninos, Validators.compose([Validators.required,Validators.max(this.maxNinos)])],
      habitacion:[this.huesped.habitacion, Validators.compose([Validators.required])],
      searchTerm:['']
    });

    const searchEvent = this.formGroup.controls.searchTerm.valueChanges
      .pipe(
        debounceTime(150),
        distinctUntilChanged()
      )
      .subscribe((val) => this.search(val));
        this.subscriptions.push(searchEvent);

    // const searchEvent = this.formGroup.controls.searchTerm.valueChanges
    // .pipe(
    //   startWith(''),
    //   map(value => this._filter(value))
    // );

  }





  save() {
  this.prepareHuesped();
  this.create();
  this.resetFoliador();
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
        this.huesped.noches=(this.toDate.day)-(this.fromDate.day)
        this.huesped.porPagar=this.huesped.tarifa*this.huesped.noches
        this.huesped.pendiente=this.huesped.tarifa*this.huesped.noches
        this.huesped.habitacion=formData.habitacion
        this.huesped.telefono=formData.telefono
        this.huesped.email=formData.email
        this.huesped.motivo=formData.motivo
        this.huesped.id=this.huesped.folio
        this.huesped.numeroCuarto=this.preAsig
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
      if(this.huesped.estatus==1){
        alert("Walk-In #"+this.huesped.folio +" Generado con exito!");
      }else
      if(this.huesped.estatus==2){
        alert("Reserva #"+this.huesped.folio +" Generada con exito!");
      }else
      if(this.huesped.estatus==6){
        alert("Bloqueo #"+this.huesped.folio +" Generada con exito!");
      }else
      if(this.huesped.estatus==7){
        alert("Reserva Temporal #"+this.huesped.folio +" Generada con exito!");
      }
      this.inicio==true;
      this.huesped= {
        id:undefined,
        folio:undefined,
        adultos:1,
        ninos:1,
        nombre: '',
        estatus: 1,
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
      this.modal.close();

  }



  search(searchTerm: string) {
    this.historicoService.patchState({ searchTerm });
  }


resetFoliador()
{
  this.foliosService.getFolios().pipe(map(
    (responseData)=>{
      const postArray = []
      for(const key in responseData)
      {
        if(responseData.hasOwnProperty(key))
        postArray.push(responseData[key]);
      }
      return postArray
    }))
    .subscribe((folios)=>{
      this.folios=(folios)
      console.log("Nuevo folio de Reserva",this.folios)
      this.huesped.folio=this.folios[0].Folio
    })
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

  getHabitaciones()
  {
    this.habitacionService.gethabitaciones()
    .pipe(map(
      (responseData)=>{
        const postArray = []
        for(const key in responseData)
        {
          postArray.push(responseData)
        }
        return postArray
      }
    ))
    .subscribe((infoCuartos)=>{
      this.infoCuarto=infoCuartos
      console.log("InfoCuartos Completa :",this.infoCuarto)
    })
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
    this.inicio==false;
    this.accordionDisplay="";

    if(this.bandera)
    {
      //DIAS DE DIFERENCIA
    let toDate =   new Date(this.toDate.year, this.toDate.month - 1, this.toDate.day);
    let fromDate = new Date(this.fromDate.year, this.fromDate.month - 1, this.fromDate.day);
    let diaDif = Math.floor((Date.UTC(toDate.getFullYear(), toDate.getMonth(), toDate.getDate()) - Date.UTC(fromDate.getFullYear(), fromDate.getMonth(), fromDate.getDate()) ) / (1000 * 60 * 60 * 24));
    //


    for (let i=0; i<diaDif; i++) {

    this.disponibilidadService.getdisponibilidadTodos(fromDate.getDate(), fromDate.getMonth()+1, fromDate.getFullYear())
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
        console.log("MySET de TODOS LOS CUARTOS: ",this.mySet)
        console.log("sinDiusponibilidad TODOS LOS CUARTOS",this.sinDisponibilidad)
        console.log("MySET TODOS LOS CUARTOS (Delete): ",this.mySet)

      })
      fromDate.setDate(fromDate.getDate() + 1);
    };

    }else
    {
      //DIAS DE DIFERENCIA
    let toDate =   new Date(this.toDate.year, this.toDate.month - 1, this.toDate.day);
    let fromDate = new Date(this.fromDate.year, this.fromDate.month - 1, this.fromDate.day);
    let diaDif = Math.floor((Date.UTC(toDate.getFullYear(), toDate.getMonth(), toDate.getDate()) - Date.UTC(fromDate.getFullYear(), fromDate.getMonth(), fromDate.getDate()) ) / (1000 * 60 * 60 * 24));
    //

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


    for (let i=0; i<diaDif; i++) {

    this.disponibilidadService.getdisponibilidad(fromDate.getDate(), fromDate.getMonth()+1, fromDate.getFullYear(),this.cuarto)
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


      })
      fromDate.setDate(fromDate.getDate() + 1);
    };

    }

  }



  preAsignar(numeroCuarto:number,codigo:string)
  {
    console.log("check.value",numeroCuarto);
    this.habitacionService.getInfoHabitaciones(numeroCuarto,codigo)
    .pipe(map((responseData)=>
    {
      const responseArray=[]
      for (const key in responseData){
        if(responseData.hasOwnProperty(key))
        responseArray.push(responseData[key]);
      }
      return responseArray

    }))
    .subscribe((infoCuartos)=>{
      this.infoCuarto=infoCuartos
      console.log("InforCuartos:",this.infoCuarto)
    });

    if(this.quantity>this.infoCuarto[0].Personas)
    {
      this.formGroup.controls['adultos'].updateValueAndValidity();
      this.maxNinos=this.infoCuarto[0].Personas
      this.maxNinos=this.infoCuarto[0].Personas_Extra
    }
    this.preAsig=numeroCuarto;
    this.cuarto=codigo;

  }

  habValue($event)
  {
    this.accordionDisplay="display:none"
    this.disponibilidad=[]
    this.mySet.clear
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
        this.bandera=true
    }else
    {
      this.cuarto = $event.target.options[$event.target.options.selectedIndex].text.replace(" ","_");
      console.log("this.cuarto",this.cuarto)
      this.bandera=false
    }
  }

  isNumber(val): boolean { return typeof val === 'number'; }
  isNotNumber(val): boolean { return typeof val !== 'number'; }


  //Mat-expansioln-Pane [Acordion]
  step = 0;

  setStep(index: number) {
    this.step = index;
    this.disponibilidad=[]
    this.mySet.clear
    this.cuartos=[]
    this.sinDisponibilidad=[]
  }

  nextStep() {
    this.step++;
  }

  prevStep() {
    this.step--;
  }





//Maximos Y Minimos Adultos Niños
  quantity:number=1;
  quantityNin:number=1;

  plus()
  {
    if(this.quantity<8){
      this.quantity++;
      this.huesped.adultos=this.quantity
      //this.formGroup.controls['ninos'].patchValue(this.quantityNin)
      //this.formGroup.controls['ninos'].updateValueAndValidity();
    }
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
    if(this.quantityNin<6)
    {
      this.quantityNin++;
      this.huesped.ninos=this.quantityNin;
    }
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

  //
  emailValidator(evetn:any)
  {
  //algo
  }

  setEstatus(value): void {
    this.huesped.estatus = value;
    if(value==1)
    {this.huesped.folio=this.folios[1].Folio}
    else
    this.huesped.folio=this.folios[0].Folio
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

  rangoFechas(llegada:string,salida:string)
  {
    let rangodeFechas
    let toDate =   new Date(parseInt(salida.split("/")[2]), parseInt(salida.split("/")[0]), parseInt(salida.split("/")[1]));
    let fromDate = new Date(parseInt(llegada.split("/")[2]), parseInt(llegada.split("/")[0]), parseInt(llegada.split("/")[1]));
    let diaDif = Math.floor((Date.UTC(toDate.getFullYear(), toDate.getMonth(), toDate.getDate()) - Date.UTC(fromDate.getFullYear(), fromDate.getMonth(), fromDate.getDate()) ) / (1000 * 60 * 60 * 24));

    if(!isNaN(diaDif)){
    this.huesped.noches=diaDif
    }else
    this.huesped.noches=1


    rangodeFechas = llegada.split("/")[1]+"/"+this.i18n.getMonthShortName(parseInt(llegada.split("/")[0]))+"/"+llegada.split("/")[2]+" - " +salida.split("/")[1]+"/"+this.i18n.getMonthShortName(parseInt(salida.split("/")[0]))+"/"+salida.split("/")[2]

    return rangodeFechas
  }


  getmyData(){
    return this.mySet;
    }

    toggleDropdown()
    {
    this.showDropDown=!this.showDropDown
    }

    closeDropDown()
    {
    this.showDropDown=false
    }

    selectValue(value){
      this.formGroup.patchValue({"search":value})
      this.showDropDown=false
    }

    getSearchValue() {
      return this.formGroup.value.search;
    }



    showList(event:any)
    {
      if(event.target.value="")
      {
        this.displayNone="display:none"
      }
      else
      this.displayNone=""
    }
    closeList()
    {
      this.displayNone="display:none"
    }

    toggleSearch() {
      let control = this.formGroup.get('searchTerm')
      control.disabled ? control.enable() : control.disable();
    }

  }


