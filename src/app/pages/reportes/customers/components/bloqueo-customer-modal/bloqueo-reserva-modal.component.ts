import {  Component, Input, OnDestroy, OnInit, ViewChild,ViewEncapsulation,ElementRef } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NgbActiveModal, NgbDateAdapter, NgbDateParserFormatter, NgbDateStruct,NgbDate, NgbCalendar,NgbDatepickerI18n, } from '@ng-bootstrap/ng-bootstrap';
import {  of, Subscription } from 'rxjs';
import { catchError,   tap } from 'rxjs/operators';
import { Estatus } from '../../../_models/estatus.model';
import { EstatusService } from '../../../_services/estatus.service';
import { CustomAdapter, CustomDateParserFormatter } from '../../../../../_metronic/core';
import { ReportesComponent } from '../../../reportes.component'
import { HttpClient } from "@angular/common/http";
import { map} from 'rxjs/operators'
import { HabitacionesService} from '../../../_services/habitaciones.service'
import { Habitaciones } from '../../../_models/habitaciones.model';
import { Disponibilidad } from '../../../_models/disponibilidad.model';
import {  NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ModalDismissReasons} from '@ng-bootstrap/ng-bootstrap';
import { BloqueoService } from '../../../_services/bloqueo.service'
import { Bloqueo } from '../../../_models/bloqueo.model';
import { DisponibilidadService } from '../../../_services/disponibilidad.service';
import { ParametrosServiceService } from 'src/app/pages/parametros/_services/parametros.service.service';
import { AlertsComponent } from '../../../../../main/alerts/alerts.component';
import {DateTime} from 'luxon'
import { MatSelect } from '@angular/material/select';
import { MatOption } from '@angular/material/core';
import { AuthService } from 'src/app/modules/auth';

type listaHabitaciones = {key:number;value:string}

let date: Date = new Date();
declare global {
  interface Date {
      getDays (start?: number) : [Date, Date]
  }
}


@Component({
  selector: 'app-edit-customer-modal',
  templateUrl: './bloqueo-reserva-modal.component.html',
  styleUrls: ['./bloqueo-reserva-modal.component.scss'],
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


export class BloqueoReservaModalComponent implements  OnInit, OnDestroy
{
  // @ViewChild('menuTrigger') menuTrigger: MatMenuTrigger;
  @ViewChild('matSelect') matSelectCuarto;
  @ViewChild('allSelected') private allSelected: MatOption;

  @ViewChild('exito') miniModal = null;
  @ViewChild('fechaIncorrecta') fechaIncorrecta = null;

  @Input()

  last_selection = null;
//DATETIMEPICKER RANGE

  hoveredDate: NgbDate | null = null;

  //Date Variables
  diaDif:number;
  fromDate: DateTime
  today: DateTime
  toDate: DateTime
  comparadorInicial:Date
  comparadorFinal:Date

  /**Subscription */
  subscription:Subscription[]=[]

  fechaInvalida:boolean=false

  checkAll = false;
  isLoading$;
  habitaciones:Habitaciones;
  
  /**Form */

  bloqueoFormGroup:FormGroup;
  myControl: FormGroup;

  mySet = new Set();
  placeHolder:string="-- Seleccione Habitación --"
  setEmpty:boolean=true;
  public cuartos:Habitaciones[]=[];
  public codigoCuarto:any[]=[];
  public infoCuarto:any[]=[];
  //Busca Dispo
  public disponibilidad:Disponibilidad[]=[];
  public sinDisponibilidad:any[]=[];


  public estatusArray:Estatus[]=[];
  public folioactualizado:any;
  public tipodeCuartoFiltrados:Array<string>=[];
  cuarto:string;
  numCuarto: Array<number>=[];

  /**Selected items */
  disponiblesIndexados:listaHabitaciones[]=[];

  sinSalidasChecked:boolean=false;
  sinLlegadasChecked:boolean=false;
  fueraDeServicioChecked:boolean=false;

  sinSalidasCheck:boolean=false;
  sinLlegadasCheck:boolean=false;
  // fueraDeServicio:boolean;
  private subscriptions: Subscription[] = [];
  public listaBloqueos:Bloqueo[];
  _isDisabled:boolean=true;
  tipoDeCuarto:Array<string>=[];
  closeResult: string;
  habitacionNumero:number;
  idDelete:string;
  desdeDelete:string;
  hastaDelete:string;
  habitacionDelete:Array<string>;
  numeroDelete:Array<number>;

  //DOM Properties
  error:string=null;
  isLoading:boolean=true
  statusBloqueo:string
  fechaInicialBloqueo:string
  fechaFinalBloqueo:string
  display:boolean=true
  isSubmitted:boolean
  inicio:boolean=true
  disponibesZero:boolean=false;
  datosFaltantes:boolean=false

  public tipoCuartoForm: FormBuilder

    constructor(
    //Date Imports
    public fb: FormBuilder,
    private modalService: NgbModal,
    private calendar: NgbCalendar,
    public formatter: NgbDateParserFormatter,
    public habitacionService : HabitacionesService,
    public modal: NgbActiveModal,
    public estatusService: EstatusService,
    public bloqueoService: BloqueoService,
    public disponibilidadService:DisponibilidadService,
    public postService : ReportesComponent,
    private http: HttpClient,
    public i18n: NgbDatepickerI18n,
    public parametrosService : ParametrosServiceService,
    public authService : AuthService
    )
    {
      this.today = DateTime.now().setZone(this.parametrosService.getCurrentParametrosValue.zona)
      // this.today= calendar.getToday();
      this.fromDate = DateTime.now().setZone(this.parametrosService.getCurrentParametrosValue.zona)
      this.toDate = DateTime.now().setZone(this.parametrosService.getCurrentParametrosValue.zona).plus({ days: 1 })

      this.fechaInicialBloqueo=this.fromDate.day+" de "+this.i18n.getMonthFullName(this.fromDate.month)+" del "+this.fromDate.year
      this.fechaFinalBloqueo=this.toDate.day+" de "+this.i18n.getMonthFullName(this.toDate.month)+" del "+this.toDate.year
      this.comparadorInicial=new Date(DateTime.local(this.fromDate.year,this.fromDate.month,this.fromDate.day))
      this.comparadorFinal=new Date(DateTime.local(this.toDate.year,this.toDate.month,this.toDate.day))
    }



  ngOnInit(): void {
    this.loadForm();
    this.getCodigosCuarto();
    this.getHabitaciones();
    this.getEstatus();
    this.getBloqueos();

    
  }

loadForm() {

  this.bloqueoFormGroup = this.fb.group({
    'tipoCuarto': [ undefined, Validators.required ],
    'numeroHab' : [undefined,Validators.required],
  });

}

get tipoCuarto() { return this.bloqueoFormGroup.get('tipoCuarto') }
get numeroHab() { return this.bloqueoFormGroup.get('numeroHab') }

onFormSubmit(value: string) {
  if (this.bloqueoFormGroup.valid) {
    this.save(value.trim())  }
  else {
    console.log('invalid');
  }
}

  getHabitaciones()
  {
    const sb =this.habitacionService.gethabitaciones()
    .subscribe((infoCuartos)=>{
      this.infoCuarto=infoCuartos
    })

    this.subscription.push(sb)

  }

  getCodigosCuarto()
  {
    this.codigoCuarto=[]
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
      this.subscription.push(sb)
  }

  getEstatus()
   {
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
                        this.subscription.push(sb)

  }


  getBloqueos()
  {
    this.listaBloqueos=[];
      const sb = this.bloqueoService.getBloqueos().subscribe((responseData)=>{
        this.listaBloqueos=responseData
        this.isLoading=false
      }, error=>{
        this.error="Algo Salio Mal Actualize la pagina"
      });
      this.subscription.push(sb)
  }




  save(text:string) {
  this.postBloqueo(text);
  }

  onlyUnique(value, index, self) {
    return self.indexOf(value) === index;
  }

  private postBloqueo(text:string) {

    if(this.bloqueoFormGroup.invalid||(this.sinSalidasChecked==false&&this.sinLlegadasChecked==false&&this.fueraDeServicioChecked==false))
    {
      this.datosFaltantes=true
      return
    }


    let desde;
    let hasta;

    this.fromDate.toString();
    this.toDate.toString();
    this.cuarto;
    this.numCuarto;
    this.sinLlegadasChecked;

    // if(this.sinLlegadasChecked &&  this.sinSalidasChecked)
    // { this.fueraDeServicio=true } else {this.fueraDeServicio=false}


        desde=this.fromDate.day+'/'+this.fromDate.month+'/'+this.fromDate.year
        hasta=this.toDate.day+'/'+this.toDate.month+'/'+this.toDate.year

        let unique = this.tipodeCuartoFiltrados.filter(this.onlyUnique)


  const sb = this.bloqueoService.postBloqueo
    (
      "_id",
      desde,
      hasta,
      unique,

      this.numCuarto,
      this.sinLlegadasChecked,
      this.sinSalidasChecked,
      this.fueraDeServicioChecked,
      text
    ).subscribe(
      ()=>{
        this.statusBloqueo="Bloqueo Generado con Exito"
        this.openMini(this.miniModal)
        this.initializeBloqueo()
        this.inicio=true
        this.disponiblesIndexados=[]
      },
      (err)=>{
        if (err)
        this.statusBloqueo="Hubo un problema al guardar el bloqueo actualize la pagina eh intente nuevamente"
        this.openMini(this.miniModal)
      },
      ()=>
      {
       //Complete Regardless
      },
    );
    this.subscription.push(sb)

      this.listaBloqueos=[]
      unique=[]
      this.numCuarto=[]
      this.tipodeCuartoFiltrados=[]
      this.sinSalidasChecked=false
      this.sinLlegadasChecked=false
      //this.getBloqueos();
      //this.modal.close();

  }

initializeBloqueo(){
  this.mySet.clear();
        this.getBloqueos();
        this.getCodigosCuarto();
        this.fromDate = this.calendar.getToday();
        this.toDate = this.calendar.getNext(this.calendar.getToday(), 'd', 1);
        this.fechaInicialBloqueo=this.fromDate.day+" de "+this.i18n.getMonthFullName(this.fromDate.month)+" del "+this.fromDate.year
        this.fechaFinalBloqueo=this.toDate.day+" de "+this.i18n.getMonthFullName(this.toDate.month)+" del "+this.toDate.year
        this.comparadorInicial=new Date(this.fromDate.year,this.fromDate.month-1,this.fromDate.day)
        this.loadForm();
}

  edit(_id:string,
    desde:string,
    hasta:string,
    habitacion:string[],
    cuarto:number[],
    sinLlegadas:boolean,
    sinSalidas:boolean,
    fueraDeServicio:boolean,
    comentarios:string,
    ) {

 this.bloqueoService.actualizaBloqueos(_id,desde,hasta,habitacion,cuarto,sinLlegadas,sinSalidas,fueraDeServicio,comentarios).subscribe((response)=>{
   if(response.status==200)
   {
     this.statusBloqueo="Bloqueo Actualizado Correctamente"
     this.openMini(this.miniModal)
   }else
   {
    this.statusBloqueo="Hubo un problema refresque la pagina eh intente nuevamente"
    this.openMini(this.miniModal)
   }
 });

  }


  borrar(_id:string,desde:string,hasta:string,habitacion:Array<string>,numero:Array<number>) {

   const sb = this.bloqueoService.deleteBloqueo(_id).subscribe((response)=>{
      if(response.status==200)
        {
          this.statusBloqueo="Bloqueo Borrado Correctamente"
          this.openMini(this.miniModal)

         const sb = this.bloqueoService.liberaBloqueos(_id,desde,hasta,habitacion,numero).subscribe((response)=>{
            console.log("liberaDispo response",response)
          });

          this.subscription.push(sb)
        }
        else
        {
          this.statusBloqueo="Hubo un problema al eliminar el bloqueo, Actualize la pagina y intente nuevamente"
          this.openMini(this.miniModal)
        }
      })
      this.subscription.push(sb)

  }


  ngOnDestroy(): void {
   this.subscriptions.forEach(sb => sb.unsubscribe());
  }



  toggleLlegadas($event)
  {
    if($event.checked==true)
    {
      this.sinLlegadasChecked = true;
    }else
    this.sinLlegadasChecked=false
  }

  toggleSalidas($event)
  {
    if($event.checked==true)
    {
      this.sinSalidasChecked = true;
    }else
    this.sinSalidasChecked=false;
  }

  toggleFuera($event)
  {
    if($event.checked==true)
    {
      this.fueraDeServicioChecked = true;
    }else
    this.fueraDeServicioChecked=false;
  }

  habValue($event)
  {
    this.inicio=false
    this.disponiblesIndexados=[]

    if($event.value==1){this.cuarto='1'}
    else{this.cuarto=$event.value}

    this.sinDisponibilidad=[];
    
     let toDate = DateTime.fromObject({year:this.toDate.year, month:this.toDate.month, day:this.toDate.day});
     let fromDate = DateTime.fromObject({year:this.fromDate.year, month:this.fromDate.month, day:this.fromDate.day});

     let diaDif = toDate.diff(fromDate, ["days"])
     this.diaDif = diaDif.days

    const comparadorInicialString=this.fromDate.day+'/'+this.fromDate.month+'/'+this.fromDate.year
    const comparadorFinalString=this.toDate.day+'/'+this.toDate.month+'/'+this.toDate.year

    if(this.diaDif==0)
    {
      this.diaDif=1;
    }
   
    const sb = this.disponibilidadService.getDisponibilidadCompleta(comparadorInicialString,comparadorFinalString,this.cuarto,'0',this.diaDif, 0)
    .subscribe(
      (disponibles)=>{
        if(disponibles.length==0){
          this.disponibesZero=true
        }else{this.disponibesZero=false}
        disponibles.sort()
        this.isLoading=false

        for(let i=0;i<disponibles.length;i++){
          this.disponiblesIndexados.push({key:i,value:disponibles[i]})
        }
        // this.mySet.clear()

        // for(let i=0;i<disponibles.length;i++){
        //   this.mySet.add(disponibles[i])
        // }
      },
      (error)=>{
        
      })
    
      this.subscriptions.push(sb)




  }

  async toggleAllSelection() {
    if (this.allSelected.selected) {
      this.bloqueoFormGroup.controls.numeroHab
        .patchValue([...this.disponiblesIndexados.map(item => item.key), 0]);

        for(let i=0;i<this.disponiblesIndexados.length;i++){
          await this.cuartoValue(true,this.disponiblesIndexados[i].value)
        }

    } else {
      this.bloqueoFormGroup.controls.numeroHab.patchValue([]);
      for(let i=0;i<this.disponiblesIndexados.length;i++){
        await this.cuartoValue(false,this.disponiblesIndexados[i].value)
      }
    }
  }

  tosslePerOne(all){ 
    if (this.allSelected.selected) {  
     this.allSelected.deselect();
     return false;
 }
   if(this.bloqueoFormGroup.controls.numeroHab.value.length==this.disponiblesIndexados.length)
     this.allSelected.select();
 
 }


  async cuartoValue(selected:boolean,value:any)
  {
    let index;
    let indexTipo;
    let codigo;

    const sb = this.habitacionService.getHabitacionbyNumero(value)
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
        codigo=(cuartos)
        if(selected==true)
        {
          this.numCuarto.push(value);
          this.tipodeCuartoFiltrados.push(codigo[0].Codigo)

        }else if(selected==false)
        {
          index=this.numCuarto.indexOf(value,0)
          this.numCuarto.splice(index,1)

          indexTipo = this.tipodeCuartoFiltrados.indexOf(codigo[0].Codigo,0)
          this.tipodeCuartoFiltrados.splice(indexTipo,1)
        }
      })
    this.subscription.push(sb)
        //this.numCuarto=this.cuarto = $event.target.options[$event.target.options.selectedIndex].text;
  }


  numCuartos($event)
  {
    this.cuartos=[]

    if($event.target.options.selectedIndex==1)
    {
        this.cuarto=""
       const sb = this.habitacionService.gethabitaciones()
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
          this.subscription.push(sb)
    }else
    {
      this.cuarto = $event.target.options[$event.target.options.selectedIndex].text.replace(" ","_");
      console.log("this.cuarto",this.cuarto)
    }
  }

  isNumber(val): boolean { return typeof val === 'number'; }
  isNotNumber(val): boolean { return typeof val !== 'number'; }




//Date Helpers
fechaSeleccionadaInicial(event:NgbDate){

  this.fromDate = event

  this.comparadorInicial = new Date(event.year,event.month-1,event.day)

  this.fechaInicialBloqueo= event.day+" de "+this.i18n.getMonthFullName(event.month)+" del "+event.year

  if(this.comparadorInicial>this.comparadorFinal)
  {
    this.display=false
  }else if(this.comparadorInicial<this.comparadorFinal)
  {this.display>=true}
}

fechaSeleccionadaFinal(event:NgbDate){

  this.toDate = event

  this.comparadorFinal = new Date(event.year,event.month-1,event.day)

  this.fechaFinalBloqueo= event.day+" de "+this.i18n.getMonthFullName(event.month)+" del "+event.year

  if(this.comparadorInicial>this.comparadorFinal)
  {
    this.display=false
  }else if(this.comparadorInicial<=this.comparadorFinal)
  {this.display=true}
}


//MODAL
openMini(exito) {

  const modalRef = this.modalService.open(exito,{ size: 'sm', backdrop:'static' });
  modalRef.result.then((result) => {
  this.closeResult = `Closed with: ${result}`;
  }, (reason) => {
      this.closeResult = `Dismissed ${this.getDismissReason(reason)}`;
  });
  setTimeout(() => {
    modalRef.close('Close click');
  },4000)
}


openFechaIncorrecta(fechaIncorrecta) {

 const modalRef = this.modalService.open(fechaIncorrecta,{ size: 'sm', backdrop:'static' });

 modalRef.result.then((result) => {
  this.closeResult = `Closed with: ${result}`;
  }, (reason) => {
      this.closeResult = `Dismissed ${this.getDismissReason(reason)}`;
  });

    setTimeout(() => {
      modalRef.close('Close click');
    },4000)


}

openDelete(borrar,id,desde,hasta,habitacion,numero) {

  const modalRef = this.modalService.open(borrar,{ size: 'sm', backdrop:'static' });
  this.idDelete = id
  this.desdeDelete = desde
  this.hastaDelete = hasta
  this.habitacionDelete = habitacion
  this.numeroDelete = numero

  modalRef.result.then((result) => {
  this.closeResult = `Closed with: ${result}`;
  }, (reason) => {
      this.closeResult = `Dismissed ${this.getDismissReason(reason)}`;
  });
  setTimeout(() => {
    modalRef.close('Close click');
  },4000)
}

// actualizaBloqueos()
// {
//   this.getBloqueos();
// }

private getDismissReason(reason: any): string {
  if (reason === ModalDismissReasons.ESC) {
      return 'by pressing ESC';
  } else if (reason === ModalDismissReasons.BACKDROP_CLICK) {
      return 'by clicking on a backdrop';
  } else {
      return  `with: ${reason}`;
  }
}



closeModal(){
  this.modal.close();
}


  }
