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
import { DisponibilidadService } from '../../../_services/disponibilidad.service';

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
  @ViewChild('exito') miniModal = null;


  @Input()

  last_selection = null;
//DATETIMEPICKER RANGE
  hoveredDate: NgbDate | null = null;

  fromDate: NgbDate | null;
  fromDate1: string;

  toDate: NgbDate | null;
  habitacionfb = new FormControl();

  checkAll = false;
  isLoading$;
  habitaciones:Habitaciones;
  formGroup: FormGroup;
  myControl: FormGroup;
  mySet = new Set();
  placeHolder:string="-- Seleccione Habitación --"
  setEmpty:boolean=true;
  public cuartos:Habitaciones[]=[];
  public codigoCuarto:any[]=[];
  public infoCuarto:any[]=[];
  public disponibilidad:Disponibilidad[]=[];
  public sinDisponibilidad:any[]=[]
  public estatusArray:Estatus[]=[];
  public folioactualizado:any;
  public tipodeCuartoFiltrados:Array<string>=[];
  cuarto:string;
  numCuarto: Array<number>=[];

  sinSalidasChecked:boolean=false;
  sinLlegadasChecked:boolean=false;

  sinSalidasCheck:boolean=false;
  sinLlegadasCheck:boolean=false;
  fueraDeServicio:boolean;
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


  constructor(
    //Date Imports
    private modalService: NgbModal,
    private calendar: NgbCalendar,
    public formatter: NgbDateParserFormatter,
    public habitacionService : HabitacionesService,
    private fb: FormBuilder, public modal: NgbActiveModal,
    public estatusService: EstatusService,
    public bloqueoService: BloqueoService,
    public disponibilidadService:DisponibilidadService,
    public postService : ReportesComponent,
    private http: HttpClient,
    public i18n: NgbDatepickerI18n
    ) {
      this.fromDate = calendar.getToday();
      //this.toDate = calendar.getNext(calendar.getToday(), 'd', 1);
      this.toDate = calendar.getToday();
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
    this.listaBloqueos=[];
      this.bloqueoService.getBloqueos().subscribe((responseData)=>{
        this.listaBloqueos=responseData
        this.isLoading=false
      }, error=>{
        this.error="Algo Salio Mal Actualize la pagina"
      });
  }




  save(text:string) {
  this.postBloqueo(text);
  }

  onlyUnique(value, index, self) {
    return self.indexOf(value) === index;
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

        let unique = this.tipodeCuartoFiltrados.filter(this.onlyUnique)

  let post = this.bloqueoService.postBloqueo
    (
      "_id",
      desde,
      hasta,
      unique,

      this.numCuarto,
      this.sinLlegadasChecked,
      this.sinSalidasChecked,
      this.fueraDeServicio,
      text
    ).subscribe((response)=>{
      console.log("estatus POST",response)
      if(response.status==200){
        this.statusBloqueo="Bloqueo Generado con Exito"
        this.openMini(this.miniModal)
        this.mySet.clear();
        this.getBloqueos();
        this.getCodigosCuarto();

      }else
      {
       this.statusBloqueo="Hubo un problema al guardar el bloqueo actualize la pagina eh intente nuevamente"
       this.openMini(this.miniModal)
      }
    });
      this.listaBloqueos=[]
      unique=[]
      this.numCuarto=[]
      this.tipodeCuartoFiltrados=[]
      this.sinSalidasChecked=false
      this.sinLlegadasChecked=false
      //this.getBloqueos();
      //this.modal.close();

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

    this.bloqueoService.deleteBloqueo(_id).subscribe((response)=>{
      if(response.status==200)
        {
          this.statusBloqueo="Bloqueo Borrado Correctamente"
          this.openMini(this.miniModal)

          this.bloqueoService.liberaBloqueos(_id,desde,hasta,habitacion,numero).subscribe((response)=>{
            console.log("liberaDispo response",response)
          });


        }
        else
        {
          this.statusBloqueo="Hubo un problema al eliminar el bloqueo, Actualize la pagina y intente nuevamente"
          this.openMini(this.miniModal)
        }
      })

    //this
    // .subscribe((response)=>{
    //   console.log("suscribe",response)
    //   if(response.status==200)
    //   {
    //     this.statusBloqueo="Bloqueo Borrado Correctamente"
    //     this.openMini(this.miniModal)

    //     this.bloqueoService.liberaBloqueos(_id,desde,hasta,habitacion,numero).subscribe((response)=>{
    //       console.log("liberaDispo response",response)
    //     });
    //   }
    //   else
    //   {
    //     this.statusBloqueo="Hubo un problema al eliminar el bloqueo, Actualize la pagina y intente nuevamente"
    //     this.openMini(this.miniModal)
    //   }
    // });

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

  habValue($event)
  {
    this.cuarto=$event.value;
    this.sinDisponibilidad=[];

    let toDate =   new Date(this.toDate.year, this.toDate.month - 1, this.toDate.day);
    let fromDate = new Date(this.fromDate.year, this.fromDate.month - 1, this.fromDate.day);
    let diaDif = Math.floor((Date.UTC(toDate.getFullYear(), toDate.getMonth(), toDate.getDate()) - Date.UTC(fromDate.getFullYear(), fromDate.getMonth(), fromDate.getDate()) ) / (1000 * 60 * 60 * 24));

    if(diaDif==0)
    {
      diaDif=1;
    }


    if($event.value==1)
    {

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
            this.mySet.clear()

            for(i=0;i<disponibles.length;i++)
            {
              this.disponibilidad=(disponibles)
              if(disponibles[i].Estatus!=1)
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


    else
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
          this.mySet.clear()
          for(i=0;i<disponibles.length;i++)
          {
            this.disponibilidad=(disponibles)
            if(disponibles[i].Estatus!=1)
            {
              this.sinDisponibilidad.push(disponibles[i].Habitacion)
            }
             this.mySet.add(this.disponibilidad[i].Habitacion)
          }
          for(i=0;i<this.sinDisponibilidad.length;i++)
          {
            this.mySet.delete(this.sinDisponibilidad[i])
          }

          // if(this.mySet.size!=0)
          // {
          //   this.setEmpty=false;
          //   this.placeHolder="-- Seleccione Habitación -- "
          // }
          // else
          // {
          //   this.setEmpty=true;
          //   this.placeHolder="Sin Disponibilidad consulte otra Fecha o Tipo de Cuarto"
          // }
          console.log("mySet x tipo",this.mySet)
        })
        fromDate.setDate(fromDate.getDate() + 1);
      };


    }

  }

  cuartoValue(selected:boolean,value:any)
  {
    let index;
    let indexTipo;
    let codigo;

    this.habitacionService.getHabitacionbyNumero(value)
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

    //this.numCuarto=this.cuarto = $event.target.options[$event.target.options.selectedIndex].text;
  }

  Allchecked(event:any)
  {
    if(this.checkAll==false)
    {
      this.checkAll=true;
    }else
    this.checkAll=false;
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
// open(content) {

//   this.modalService.open(content,{size:'sm'}).result.then((result) => {
//   this.closeResult = `Closed with: ${result}`;
//   }, (reason) => {
//       this.closeResult = `Dismissed ${this.getDismissReason(reason)}`;
//   });

// }

//MODAL
openMini(exito) {

  this.modalService.open(exito,{ size: 'sm' }).result.then((result) => {
  this.closeResult = `Closed with: ${result}`;
  }, (reason) => {
      this.closeResult = `Dismissed ${this.getDismissReason(reason)}`;
  });

}

openDelete(borrar,id,desde,hasta,habitacion,numero) {

  const modalRef = this.modalService.open(borrar,{ size: 'sm' });
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


//CheckBox
okayChecked() {
  // this.last_selection = this.formGroup.controls.project.value
  this.matSelect.close()
}

closeModal(){
  this.modal.close();
}

  }