import { Component, OnInit, ViewChild } from '@angular/core';
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

@Component({
  selector: 'app-modifica-huesped',
  templateUrl: './modifica-huesped.component.html',
  styleUrls: ['./modifica-huesped.component.scss']
})
export class ModificaHuespedComponent implements OnInit {
  @ViewChild('error') errorModal: null;
  @ViewChild('exito') exitoModal: null;
  @ViewChild('matSelect') matSelect = null;

  huesped:Huesped;
  fullFechaSalida:string;
  fullFechaLlegada:string;
  closeResult: string;
  //mensajes personalizados
  mensaje_exito:string;
  placeHolder:string="-- Seleccione Habitación --"

  //Fechas
  fromDate: NgbDate | null;
  today: NgbDate | null;
  comparadorInicial:Date;
  display:boolean=true;
  comparadorFinal:Date
  toDate: NgbDate | null;
  //Disponibilidad
  cuarto:string;
  sinDisponibilidad:any[]=[]
  mySet = new Set();
  disponibilidad:Disponibilidad[]=[];
  cuartos:Habitaciones[]=[];
  codigoCuarto:any[]=[];
  numCuarto: Array<number>=[];
  tipodeCuartoFiltrados:Array<string>=[];
  infoCuarto:any[]=[];



  //Forms
  modificaHuespedFormGroup: FormGroup;
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
    this.today= calendar.getToday();
      this.fromDate = calendar.getToday();
      this.toDate = calendar.getNext(calendar.getToday(), 'd', 1);
  }

  ngOnInit(): void {
    this.formatFechas();
    this.loadForm();
    this.getCodigosCuarto();
    this.getHabitaciones();
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

  loadForm() {

    this.modificaHuespedFormGroup = this.fb.group({
      'tipoCuarto': [ undefined, Validators.required ],
      'numeroHab' : [undefined,Validators.required],
    });
  
  }

  get tipoCuarto() { return this.modificaHuespedFormGroup.get('tipoCuarto') }
  get numeroHab() { return this.modificaHuespedFormGroup.get('numeroHab') }

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

    this.fromDate = event
  
    this.comparadorInicial = new Date(event.year,event.month-1,event.day)
  
    this.fullFechaLlegada= event.day+" de "+this.i18n.getMonthFullName(event.month)+" del "+event.year
  
    if(this.comparadorInicial>this.comparadorFinal)
    {
      this.display=false
    }else if(this.comparadorInicial<this.comparadorFinal)
    {this.display=true}
  }

  fechaSeleccionadaFinal(event:NgbDate){

    this.toDate = event
  
    this.comparadorFinal = new Date(event.year,event.month-1,event.day)
  
    this.fullFechaSalida= event.day+" de "+this.i18n.getMonthFullName(event.month)+" del "+event.year
  
    if(this.comparadorInicial>this.comparadorFinal)
    {
      this.display=false
    }else if(this.comparadorInicial<this.comparadorFinal)
    {this.display=true}
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
              if(disponibles[i].Estatus==0)
              {
                this.sinDisponibilidad.push(disponibles[i].Habitacion)
              }
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

  closeModal(){
    this.modal.close();
  }
  checkOut(estatus:number,folio:number)
    {
      if (this.huesped.pendiente==0)
      {
        this.estatusService.actualizaEstatus(estatus,folio)
          .subscribe(
            ()=>
            {
    
            },
            (err)=>{
              if(err){
                const modalRef=this.modalService.open(this.errorModal,{size:'sm'})
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
      
              const modalRef = this.modalService.open(this.exitoModal,{size:'sm'})
              modalRef.result.then((result) => {
                this.closeResult = `Closed with: ${result}`;
                }, (reason) => {
                    this.closeResult = `Dismissed ${this.getDismissReason(reason)}`;
                });
                setTimeout(() => {
                  modalRef.close('Close click');
                },4000)
                this.mensaje_exito="Chek-Out Realizado con Exito"

            this.customerService.fetch();
          });
        }
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

    okayChecked() {
      // this.last_selection = this.formGroup.controls.project.value
      this.matSelect.close()
    }

}
