import {  Component, Input, OnDestroy, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
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
import {MatSelect} from '@angular/material/select';
import {MatMenuTrigger} from '@angular/material/menu';
import { DialogComponent } from './components/dialog/dialog.component';
import {HistoricoService} from '../../../_services/historico.service'
import { ModalDismissReasons} from '@ng-bootstrap/ng-bootstrap';
import {preAsigModel} from '../../../_models/_models_helpers/preAsig'
import { AlertsComponent } from '../../../../../main/alerts/alerts.component';
import { ParametrosServiceService } from 'src/app/pages/parametros/_services/parametros.service.service';
import {DateTime} from 'luxon'
import { DivisasService } from 'src/app/pages/parametros/_services/divisas.service';

// const todayDate = new Date();

// const todayString = todayDate.getUTCDate()+"/"+todayDate.getUTCMonth()+"/"+todayDate.getUTCFullYear()+"-"+todayDate.getUTCHours()+":"+todayDate.getUTCMinutes()+":"+todayDate.getUTCSeconds()

const EMPTY_CUSTOMER: Huesped = {
  id:undefined,
  folio:undefined,
  adultos:1,
  ninos:0,
  nombre: '',
  estatus: '',
  llegada:'',
  salida:'',
  noches: 1,
  tarifa:500,
  porPagar: 500,
  pendiente:500,
  origen: '',
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
  numeroCuarto: 0,
  creada:'',
  tipoHuesped:"Regular",
  notas:'',
  vip:'',
  ID_Socio:0
};

@Component({
  selector: 'app-edit-customer-modal',
  templateUrl: './nueva-reserva-modal.component.html',
  styleUrls: ['./nueva-reserva-modal.component.scss'],
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
  @ViewChild('tipodeCuartoDropDown') tipodeCuartoDropDown: null;

  @Input()

//DATETIMEPICKER RANGE
  hoveredDate: NgbDate | null = null;
  
  ToDoListForm:any;
  diaDif:number;

  closeResult: string;
  minDate:NgbDateStruct;

  filteredOptions: Observable<string[]>;
  public dialog: MatDialog
  searchGroup: FormGroup;
  mySet = new Set();
  maxAdultos:number=6;
  maxNinos:number=6;
  bandera:boolean=false;
  inicio : boolean = true;
  id:number;
  folio:number;
  model:NgbDateStruct;
  huesped: Huesped;
  foliador:Foliador;
  banderaExito:boolean;
  habitaciones:Habitaciones;
  folioLetra:string;
  formGroup: FormGroup;
  myControl: FormGroup;
  preAsig = new Set<preAsigModel>();
  searchValue:string='';
  dropDownHabValueIndex:any
  origenReserva='Online'

  /*FECHAS*/
  today: DateTime | null;
  tomorrow: DateTime | null;
  fechaInicial:string
  fechaFinal:string
  comparadorInicial:Date
  comparadorFinal:Date
  todayDate:DateTime
  todayString:string
  fromDate: DateTime;
  toDate: DateTime;

  /**DOM */
  display:boolean=true
  isLoading:boolean=false;
  displayNone:string = "display:none"
  showDropDown=false;
  accordionDisplay="";
  _isDisabled:boolean=true;
  banderaDisabled:boolean=true;
  noDisabledCheckIn:boolean

/**Models */
  public folios:Foliador[]=[];
  public cuartos:Habitaciones[]=[];
  public codigoCuarto:Habitaciones[]=[];
  public infoCuarto:Habitaciones[]=[];
  public disponibilidad:Disponibilidad[]=[];
  public sinDisponibilidad:any[]=[]
  public estatusArray:Estatus[]=[];
  public folioactualizado:any;
  cuarto:string;
  public listaFolios:Foliador[];
  estatusID:number;
  personasXCuarto:any[]=[]

    /*Subscriptions*/
  private subscriptions: Subscription[] = [];
  


  constructor(
    //Date Imports
    private modalService: NgbModal,
    public calendar: NgbCalendar,
    public formatter: NgbDateParserFormatter,
    public habitacionService : HabitacionesService,
    public foliosService : FoliosService,
    private customersService: HuespedService,
    public historicoService: HistoricoService,
    private disponibilidadService:DisponibilidadService,
    private fb: FormBuilder, public modal: NgbActiveModal,
    public customerService: HuespedService,
    public estatusService: EstatusService,
    public postService : ReportesComponent,
    private http: HttpClient,
    public i18n: NgbDatepickerI18n,
    public parametrosService:ParametrosServiceService,
    public divisasService:DivisasService
    ) {
      
      this.todayDate = DateTime.now().setZone(parametrosService.getCurrentParametrosValue.zona)
      this.todayString = this.todayDate.day.toString()+"/"+(this.todayDate.month).toString()+"/"+this.todayDate.year.toString()+"-"+this.todayDate.hour.toString()+":"+this.todayDate.minute.toString()+":"+this.todayDate.second.toString()
      this.today = DateTime.now().setZone(this.parametrosService.getCurrentParametrosValue.zona)
      this.tomorrow = this.today.plus({days:1})

      this.fromDate = DateTime.now().setZone(parametrosService.getCurrentParametrosValue.zona)
      this.toDate = DateTime.now().setZone(parametrosService.getCurrentParametrosValue.zona)
      this.toDate = this.toDate.plus({ days: 1 });

      this.minDate=calendar.getToday();

      this.fechaInicial=this.fromDate.day+" de "+this.i18n.getMonthFullName(this.fromDate.month)+" del "+this.fromDate.year
      this.fechaFinal=this.toDate.day+" de "+this.i18n.getMonthFullName(this.toDate.month)+" del "+this.toDate.year
      
      this.comparadorInicial=new Date(DateTime.local(this.fromDate.year,this.fromDate.month,this.fromDate.day))
      this.comparadorFinal=new Date(DateTime.local(this.toDate.year,this.toDate.month,this.toDate.day))

    }



  ngOnInit(): void {
    this.getParametros();
    this.historicoService.fetch();
    this.loadCustomer();
    this.getHabitaciones();
    this.getDispo();
    this.getFolios();
    this.getEstatus();

    if(this.fromDate.day==this.todayDate.day && this.fromDate.month==this.todayDate.month && this.fromDate.year==this.todayDate.year)
    {this.noDisabledCheckIn=true}
    else
    {this.noDisabledCheckIn=false}
  }



  getParametros(){
    const sb = this.parametrosService.getParametros().subscribe(
      (value)=>{
        
      },
      (error)=>{
        const modalRef=this.modalService.open(AlertsComponent,{ size: 'sm', backdrop:'static' })
        modalRef.componentInstance.alertsHeader='Error'
        modalRef.componentInstance.mensaje='No se pudieron cargar los Parametros intente de nuevo'
      })

      this.subscriptions.push(sb)
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
      nombre: ['', Validators.compose([Validators.required, Validators.minLength(3), Validators.maxLength(100)])],
      email: ['', Validators.compose([Validators.email,Validators.pattern("^[a-z0-9._%+-]+@[a-z0-9.-]+\\.[a-z]{2,4}$"),Validators.minLength(3),Validators.maxLength(50)])],
      telefono: ['', Validators.compose([Validators.nullValidator,Validators.pattern('[0-9]+'),Validators.minLength(10),Validators.maxLength(14)])],
      salida:[this.huesped.salida, Validators.compose([])],
      llegada:[this.huesped.llegada, Validators.compose([])],
      adultos:[this.huesped.adultos, Validators.compose([Validators.max(this.maxAdultos)])],
      ninos:[this.huesped.ninos, Validators.compose([Validators.max(this.maxNinos)])],
      habitacion:[this.huesped.habitacion, Validators.compose([Validators.required])],
      checkbox:[false,Validators.required],
      searchTerm:['',Validators.maxLength(100)]
    });



    const searchEvent = this.formGroup.controls.searchTerm.valueChanges
      .pipe(
        debounceTime(150),
        distinctUntilChanged()
      )
      .subscribe((val) => this.search(val));
        this.subscriptions.push(searchEvent);


  }

  //Getters
  get habitacion() { return this.formGroup.get('habitacion') }
  get nombre(){return this.formGroup.get('nombre')}

  onSubmit(){
    if(this.formGroup.valid)
    {
      this.save();
    }else if(this.formGroup.invalid)
    {
      this.findInvalidControlsRecursive(this.formGroup);
    }
  }

  //CheckEstatus Controls
  public findInvalidControlsRecursive(formToInvestigate:FormGroup):string[] {
    var invalidControls:string[] = [];
    let recursiveFunc = (form:FormGroup) => {
      Object.keys(form.controls).forEach(field => {
        const control = form.get(field);
        if (control.invalid) invalidControls.push(field);
        if (control instanceof FormGroup) {
          recursiveFunc(control);
        }
      });
    }
    recursiveFunc(formToInvestigate);
    return invalidControls;
  }


  customerServiceFetch()
  {
    this.customerService.fetch()
  }

  getFolios(): void
  {

   const sb = this.foliosService.getFolios()
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
                        .subscribe((folios)=>{
                          this.folios=(folios)
                        })

                        this.subscriptions.push(sb)

  }

  getEstatus(): void {
    const sb = this.estatusService.getEstatus()
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

                        this.subscriptions.push(sb)

  }

  save() {
  this.prepareHuesped();
  this.create();
  this.getFolios();
    // this.huesped=EMPTY_CUSTOMER
    // this.banderaExito=true;
    

  }

  resetHuesped(){
    this.huesped.id=undefined,
    this.huesped.folio=undefined,
    this.huesped.adultos=1,
    this.huesped.ninos=0,
    this.huesped.nombre= '',
    this.huesped.estatus= '',
    this.huesped.llegada='',
    this.huesped.salida='',
    this.huesped.noches= 1,
    this.huesped.tarifa=500,
    this.huesped.porPagar= 500,
    this.huesped.pendiente=500,
    this.huesped.origen= '',
    this.huesped.habitacion= '',
    this.huesped.telefono="",
    this.huesped.email="",
    this.huesped.motivo="",
    //  OtrosDatos
    this.huesped.fechaNacimiento='',
    this.huesped.trabajaEn='',
    this.huesped.tipoDeID='',
    this.huesped.numeroDeID='',
    this.huesped.direccion='',
    this.huesped.pais='',
    this.huesped.ciudad='',
    this.huesped.codigoPostal='',
    this.huesped.lenguaje='Español',
    this.huesped.numeroCuarto= 0,
    this.huesped.creada='',
    this.huesped.tipoHuesped="Regular",
    this.huesped.notas='',
    this.huesped.vip='',
    this.huesped.ID_Socio=0
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

    for(let habitaciones of this.preAsig)
    {

      let diaFromDate = this.fromDate.day.toString().padStart(2, '0');
      let mesFromDate = this.fromDate.month.toString().padStart(2, '0');
      let anoFromDate = this.fromDate.year      
      
      let diaToDate = this.toDate.day.toString().padStart(2, '0');
      let mesToDate = this.toDate.month.toString().padStart(2, '0');
      let anoToDate = this.toDate.year

      const formData = this.formGroup.value;
      this.huesped.origen=this.origenReserva;
      this.huesped.llegada = diaFromDate +"/"+ mesFromDate +"/"+ anoFromDate
      this.huesped.salida = diaToDate +"/"+ mesToDate +"/"+ anoToDate
      this.huesped.nombre = formData.nombre;


        this.huesped.noches=Math.trunc((this.diaDif>=1) ? this.diaDif : (this.diaDif-1))
        this.huesped.porPagar=this.huesped.tarifa*this.huesped.noches
        this.huesped.pendiente=this.huesped.tarifa*this.huesped.noches
        this.huesped.habitacion=habitaciones.codigo
        this.huesped.telefono=formData.telefono
        this.huesped.email=formData.email
        this.huesped.motivo=formData.motivo
        this.huesped.id=this.huesped.folio
        this.huesped.numeroCuarto=habitaciones.habitacion
        this.huesped.creada=this.todayString.split('-')[0]
        this.huesped.tipoHuesped="Regular"


  let post = this.customerService.addPost(this.huesped)
  .subscribe(
      ()=>{



          const modalRef = this.modalService.open(AlertsComponent,{ size: 'sm', backdrop:'static' })
          modalRef.componentInstance.alertHeader = 'Exito'
          modalRef.componentInstance.mensaje='Húesped Generado con éxito'          
          modalRef.result.then((result) => {
            this.closeResult = `Closed with: ${result}`;
            }, (reason) => {
                this.closeResult = `Dismissed ${this.getDismissReason(reason)}`;
            });
            setTimeout(() => {
              modalRef.close('Close click');
            },4000)
            this.banderaExito=false 
      },
      (err)=>{
        if(err){
          this.formGroup.get("habitacion").patchValue(0);

          const modalRef = this.modalService.open(AlertsComponent,{ size: 'sm', backdrop:'static' })
          modalRef.componentInstance.alertHeader = 'Error'
          modalRef.componentInstance.mensaje='No se pudo guardar el húesped intente de nuevo mas tarde'
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
      });

      this.huesped.folio=this.huesped.folio+1

      this.subscriptions.push(post)

    }

    this.modal.close();

  }

  search(searchTerm: string) {
    this.historicoService.patchState({ searchTerm });
  }

  

  ngOnDestroy(): void {
    this.subscriptions.forEach(sb => sb.unsubscribe());
    this.resetHuesped();
    this.formGroup.patchValue({['habitacion']: 0});


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
   const sb =  this.habitacionService.gethabitaciones()
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
    this.subscriptions.push(sb)

  }

  getDispo()
  {
   const sb = this.habitacionService.getCodigohabitaciones()
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
      this.subscriptions.push(sb)

  }

  searchArray(arr, codigoCuarto, capacidadMaxima) {
    const { length } = arr;
    const isObjectPresent = arr.find((o) => o.codigoCuarto === codigoCuarto);
    // const found = arr.some(el => el.Codigo === codigoCuarto);
    if (isObjectPresent===undefined) arr.push({ Codigo:codigoCuarto,Personas:capacidadMaxima });
    return arr;
  }

  resetDispo(){
    this.accordionDisplay="display:none"
    this.disponibilidad=[]
    this.mySet.clear()
    this.cuarto=''
    this.preAsig.clear();
    // this.formGroup.get("habitacion").patchValue(0);
    this.formGroup.patchValue({['habitacion']: 0});

  }

  buscaDispo(codigoCuarto:string)
  {
    this.resetDispo()

    this.cuarto=codigoCuarto
    // this.cuartos=this.codigos
    if(this.cuarto=='1'){
      this.bandera=true
      this.dropDownHabValueIndex=1
    }else{
      this.bandera=false
      this.dropDownHabValueIndex=''
    }
    
    let folio=1

    this.formGroup.controls['checkbox'].setValue(false);
    this.isLoading=true;
    // this.inicio=true;


    let diaDif = this.toDate.diff(this.fromDate, ["years", "months", "days", "hours"])
    this.diaDif = diaDif.days

    const comparadorInicialString=this.fromDate.day+'/'+this.fromDate.month+'/'+this.fromDate.year
    const comparadorFinalString=this.toDate.day+'/'+this.toDate.month+'/'+this.toDate.year


    const sb =this.disponibilidadService.getDisponibilidadCompleta(comparadorInicialString,comparadorFinalString,this.cuarto,this.huesped.numeroCuarto,this.diaDif, folio)
    .subscribe(
      (disponibles)=>{
        this.accordionDisplay=''
        this.isLoading=false
        this.inicio=false;
        for(let i=0;i<disponibles.length;i++){
          this.mySet.add(disponibles[i])
        }
        this.setStep(1)  
      },
      (error)=>{})
    
      this.subscriptions.push(sb)

    }



  preAsignar(numeroCuarto:number,codigo:string,event,tarifa:number)
  {

    this.huesped.tarifa=tarifa;

    if(event)
    {
      this.preAsig.add({habitacion:numeroCuarto,codigo:codigo});
      // this.tempCheckBox=true
    }
    else
    {
      this.preAsig.forEach(item =>
        {
          if (item.codigo === codigo && item.habitacion === numeroCuarto)
              this.preAsig.delete(item);
            });
    }

      this.findInvalidControlsRecursive(this.formGroup);

    const sb = this.habitacionService.getInfoHabitaciones(numeroCuarto,codigo)
    .subscribe((infoCuartos)=>{
      this.infoCuarto=infoCuartos
    });

    this.subscriptions.push(sb)

    if(this.quantity>this.infoCuarto[0].Personas)
    {
      this.formGroup.controls['adultos'].updateValueAndValidity();
      this.maxNinos=this.infoCuarto[0].Personas
      this.maxNinos=this.infoCuarto[0].Personas_Extra
    }


  }




  isNumber(val): boolean { return typeof val === 'number'; }
  isNotNumber(val): boolean { return typeof val !== 'number'; }


  //Mat-expansioln-Pane [Acordion]
  step = 0;

  setStep(index: number) {
    this.step = index;
  
  }

  nextStep() {
    this.step++;
  }

  prevStep() {
    this.step--;
  }

//Date Helpers
fechaSeleccionadaInicial(event:NgbDate){
 
  this.resetDispo()

  // this.formGroup.get("habitacion").patchValue(0);
  this.formGroup.patchValue({['habitacion']: 0});


  this.fromDate = DateTime.fromObject({day:event.day,month:event.month,year:event.year})

  this.comparadorInicial = new Date(event.year,event.month-1,event.day)

  this.fechaInicial= event.day+" de "+this.i18n.getMonthFullName(event.month)+" del "+event.year

  let diaDif = this.toDate.diff(this.fromDate, ["years", "months", "days", "hours"])
  this.diaDif = diaDif.days

  if(this.fromDate.day==this.todayDate.day && this.fromDate.month==this.todayDate.month && this.fromDate.year==this.todayDate.year)
    {this.noDisabledCheckIn=true}
    else
    {this.noDisabledCheckIn=false}

  if(this.comparadorInicial>=this.comparadorFinal)
  {
    this.display=false
    this.huesped.noches=1
  }
  else if(this.comparadorInicial<=this.comparadorFinal)
  { this.display=true
    this.huesped.noches=this.diaDif
  }else if (this.comparadorInicial==this.comparadorFinal)
  {
    this.display=false
  }
}

fechaSeleccionadaFinal(event:NgbDate){
  
  this.resetDispo()

  this.formGroup.get("habitacion").patchValue(0);

  this.toDate = DateTime.fromObject({day:event.day,month:event.month,year:event.year})

  this.comparadorFinal = new Date(event.year,event.month-1,event.day)

  this.fechaFinal= event.day+" de "+this.i18n.getMonthFullName(event.month)+" del "+event.year

  let diaDif = this.toDate.diff(this.fromDate, ["years", "months", "days", "hours"])
  this.diaDif = diaDif.days

  if(this.fromDate.day==this.todayDate.day && this.fromDate.month==this.todayDate.month && this.fromDate.year==this.todayDate.year)
    {this.noDisabledCheckIn=true}
    else
    {this.noDisabledCheckIn=false}

  if(this.comparadorInicial>=this.comparadorFinal)
  {
    this.display=false
    this.huesped.noches=1
  }else if(this.comparadorInicial<=this.comparadorFinal)
  { 
    this.display=true
    this.huesped.noches=this.diaDif
  }else if (this.comparadorInicial==this.comparadorFinal)
  {
    this.display=false
  }
}


//Maximos Y Minimos Adultos Niños
  quantity:number=1;
  quantityNin:number=0;

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
    if(this.quantityNin<7)
    {
      this.quantityNin++;
      this.huesped.ninos=this.quantityNin;
    }
  }
  minusNin()
  {
    if(this.quantityNin>0)
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
    
    for(let i=0; i<this.estatusArray.length; i++)
    {
      if(value==this.estatusArray[i].id)
      {
        this.huesped.estatus = this.estatusArray[i].estatus;
      }
    }

    if(value==1)
    {
      this.huesped.folio=this.folios[2].Folio
      this.estatusID=value
      this.origenReserva='Walk-In'
    }
    else
    {this.huesped.folio=this.folios[0].Folio
    this.estatusID=value
    this.origenReserva='Recepción'}


}


  onSelectHuesped(event)
  {
    this.huesped.nombre=event.nombre;
    this.huesped.email=event.email;
    this.huesped.telefono=event.telefono;

  }



  // onDateSelection(date: NgbDate) {
  //   this.accordionDisplay="display:none"
  //   this.disponibilidad=[]
  //   this.mySet.clear
  //   this.cuarto=''
  //   this.preAsig.clear();

  //   this.formGroup.get("habitacion").patchValue(0);

  //   let fromDateNGB = {
  //     "year": this.fromDate.year,
  //     "month": this.fromDate.month,
  //     "day": this.fromDate.day
  //   }

  //   if (!this.fromDate && !this.toDate) {
  //     // this.fromDate = date;
  //     this.fromDate = DateTime.fromObject({day: date.day, month: date.month, year:date.year }, { zone: this.parametrosService.getCurrentParametrosValue.zona})
  //   } else if (this.fromDate && !this.toDate && date && date.after(fromDateNGB)) {
  //     this.toDate = DateTime.fromObject({day: date.day, month: date.month, year:date.year }, { zone: this.parametrosService.getCurrentParametrosValue.zona})
  //   } else {
  //     this.toDate = null;
  //     // this.fromDate = date;
  //     this.fromDate = DateTime.fromObject({day: date.day, month: date.month, year:date.year }, { zone: this.parametrosService.getCurrentParametrosValue.zona})

  //   }
  




    // this.tipodeCuartoDropDown.value = 0;
  //}

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

  // rangoFechas(llegada:string,salida:string)
  // {
    
  //   let rangodeFechas

  //   let toDate =   new DateTime(parseInt(salida.split("/")[2]), parseInt(salida.split("/")[0]), parseInt(salida.split("/")[1]));
  //   let fromDate = new DateTime(parseInt(llegada.split("/")[2]), parseInt(llegada.split("/")[0]), parseInt(llegada.split("/")[1]));

  //   const diaDif = fromDate.diff(toDate, ["years", "months", "days", "hours"])

  //   // let diaDif = Math.floor((DateTime(toDate.year, toDate.month, toDate.day) - DateTime(fromDate.year, fromDate.month, fromDate.day) ) );

  //   if(!isNaN(diaDif.days)){
  //   this.huesped.noches=diaDif.days
  //   }else
  //   this.huesped.noches=1


  //   rangodeFechas = llegada.split("/")[1]+"/"+this.i18n.getMonthShortName(parseInt(llegada.split("/")[0]))+"/"+llegada.split("/")[2]+" - " +salida.split("/")[1]+"/"+this.i18n.getMonthShortName(parseInt(salida.split("/")[0]))+"/"+salida.split("/")[2]

  //   return rangodeFechas
  // }


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



    showList(x)
    {
      this.displayNone=""

      if(x.key!="Backspace" && x.key!="Shift" && x.key!="Control" && x.key!="Enter") {this.searchValue += x.key;}
      else
      if (x.key=="Backspace")
      {
        this.searchValue =this.searchValue.substring(0, this.searchValue.length - 1);

        if(this.searchValue==""){this.displayNone="display:none"}
      }


    }

    limpiaInput(){
      this.searchValue=""
    }

    closeList()
    {
      this.displayNone="display:none"
    }

    toggleSearch() {
      let control = this.formGroup.get('searchTerm')
      control.disabled ? control.enable() : control.disable();
    }


    //MODAL
    open(content) {

      this.modalService.open(content).result.then((result) => {
      this.closeResult = `Closed with: ${result}`;
      }, (reason) => {
          this.closeResult = `Dismissed ${this.getDismissReason(reason)}`;
      });

      this.inicio==true;
      this.huesped=EMPTY_CUSTOMER
  
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
  closeModal()
  {
    this.modal.close();
  }
  }




  