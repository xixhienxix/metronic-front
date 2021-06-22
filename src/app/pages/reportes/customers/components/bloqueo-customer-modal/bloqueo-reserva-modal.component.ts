import {  Component, Input, OnDestroy, OnInit, ViewChild,ViewEncapsulation } from '@angular/core';
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
import {FormControl} from '@angular/forms';
import {MatDialog, MatDialogRef, MAT_DIALOG_DATA} from '@angular/material/dialog';

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
  @ViewChild('matSelect') matSelect = null;

  @Input()

  last_selection = null;
//DATETIMEPICKER RANGE
  hoveredDate: NgbDate | null = null;

  fromDate: NgbDate | null;
  fromDate1: string;

  toDate: NgbDate | null;
  habitacionfb = new FormControl();


  isLoading$;
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
  numCuarto: string;
  sinSalidasChecked:boolean=false;
  sinLlegadasChecked:boolean=false;
  fueraDeServicio:boolean;
  private subscriptions: Subscription[] = [];
  public listaBloqueos:Bloqueo[];
  _isDisabled:boolean=true;
  tipoDeCuarto:string="";
  closeResult: string;
  habitacionNumero:number;



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




  save(text:string) {
  this.postBloqueo(text);
  }



  private postBloqueo(text:string) {

    let desde;
    let hasta;

    this.fromDate.toString();
    this.toDate.toString();
    this.cuarto;
    this.numCuarto;
    this.sinLlegadasChecked;

    if(this.sinLlegadasChecked &&  this.sinSalidasChecked)
    { this.fueraDeServicio=true } else {this.fueraDeServicio=false}

        desde=this.fromDate.day+'/'+this.fromDate.month+'/'+this.fromDate.year
        hasta=this.toDate.day+'/'+this.toDate.month+'/'+this.toDate.year

  let post = this.postService.postBloqueo
    (
      desde,
      hasta,
      this.tipoDeCuarto,
      parseInt(this.numCuarto),
      this.sinLlegadasChecked,
      this.sinSalidasChecked,
      this.fueraDeServicio,
      text
    );
      this.listaBloqueos=[]
      this.getBloqueos();
      this.modal.close();

  }


  edit(id:number) {

  //   this.bloqueoService.getBloqueosbyId();

  //   let desde;
  //   let hasta;

  //   this.fromDate.toString();
  //   this.toDate.toString();
  //   this.cuarto;
  //   this.numCuarto;
  //   this.sinLlegadasChecked;

  //   if(this.sinLlegadasChecked &&  this.sinSalidasChecked)
  //   { this.fueraDeServicio=true } else {this.fueraDeServicio=false}

  //       desde=this.fromDate.day+'/'+this.fromDate.month+'/'+this.fromDate.year
  //       hasta=this.toDate.day+'/'+this.toDate.month+'/'+this.toDate.year

  // let post = this.postService.postBloqueo
  //   (
  //     desde,
  //     hasta,
  //     this.cuarto,
  //     parseInt(this.numCuarto),
  //     this.sinLlegadasChecked,
  //     this.sinSalidasChecked,
  //     this.fueraDeServicio,
  //     text
  //   );

  //   const sbUpdate = this.postService.actualizaBloqueos(id);

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

  habValue($event)
  {

    // if($event.target.options.selectedIndex==1)
    if($event.value==1)

    {
        this.cuarto=""
        this.tipoDeCuarto="Todos"
        this.habitacionService.gethabitaciones()
          .subscribe((cuartos)=>{
            this.infoCuarto=(cuartos)
          })
    }else
    {
      this.cuarto = $event.value.replace(" ","_");
      this.tipoDeCuarto=$event.value.replace("_"," ");
      console.log("this.cuarto",this.cuarto)
      this.infoCuarto = []

      this.habitacionService.getHabitacionesbyTipo(this.cuarto)
      .subscribe((listado)=>{
        this.infoCuarto=listado;
      })

    }
    // this.cuarto = $event.target.options[$event.target.options.selectedIndex].text.replace(" ","_");

  }

  cuartoValue($event)
  {
    this.numCuarto=this.cuarto = $event.target.options[$event.target.options.selectedIndex].text;
  }


  numCuartos($event)
  {
    this.cuartos=[]

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






//MODAL
open(content) {

  this.modalService.open(content).result.then((result) => {
  this.closeResult = `Closed with: ${result}`;
  }, (reason) => {
      this.closeResult = `Dismissed ${this.getDismissReason(reason)}`;
  });

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


//CheckBox
okayChecked() {
  // this.last_selection = this.formGroup.controls.project.value
  this.matSelect.close()
}

closeModal(){
  this.modal.close();
}

  }
