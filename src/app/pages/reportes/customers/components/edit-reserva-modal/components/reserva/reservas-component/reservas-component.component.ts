import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NgbCalendar, NgbDate, NgbDatepickerI18n } from '@ng-bootstrap/ng-bootstrap';
import { Subscription } from 'rxjs';
import { Adicional } from 'src/app/pages/reportes/_models/adicional.model';
import { Huesped } from 'src/app/pages/reportes/_models/customer.model';
import { Estatus } from 'src/app/pages/reportes/_models/estatus.model';
import { AdicionalService } from 'src/app/pages/reportes/_services/adicional.service';
import { EditReservaModalComponent } from '../../../edit-reserva-modal.component';

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
  selector: 'app-reservas-component',
  templateUrl: './reservas-component.component.html',
  styleUrls: ['./reservas-component.component.scss']
})
export class ReservasComponentComponent implements OnInit {
  
  formGroup:FormGroup
  /*Date Variables*/
  fullFechaSalida:string
  fullFechaLlegada:string
  fromDate: NgbDate | null;
  toDate: NgbDate | null;
  comparadorInicial:Date
  comparadorFinal:Date
  fechaFinalBloqueo:string
  fechaInicialBloqueo:string
  noches:number;

  /*Models*/
  huesped: Huesped;
  adicionalArray:Adicional[]=[];
  estatusArray:Estatus[]=[];
  private subscriptions: Subscription[] = [];

  /*Diseño Dinamico*/
  changeStyleHidden:string = 'display:none'
  setLabel:string="label label-lg label-light-primary label-inline"


  constructor(
    public i18n: NgbDatepickerI18n,
    private adicionalService : AdicionalService,
    private calendar: NgbCalendar,
    public editService : EditReservaModalComponent,
    public fb : FormBuilder
  ) {  
    this.fromDate = calendar.getToday();
    this.toDate = calendar.getNext(calendar.getToday(), 'd', 1); 
    this.fechaFinalBloqueo=this.toDate.day+" de "+this.i18n.getMonthFullName(this.toDate.month)+" del "+this.toDate.year }

  ngOnInit(): void {
    this.getAdicionales();

    this.editService.huespedUpdate$.subscribe((value)=>{
      console.log(value)
      this.huesped=value
    })
    
    this.formatFechas();
    this.loadForm();

  }
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

  loadForm() {

    this.noches=-parseInt((this.huesped.llegada.toString()).split("/")[0])+parseInt((this.huesped.salida.toString()).split("/")[0])
    console.log("",(this.huesped.llegada.toString()).split("/")[0])
    console.log("",(this.huesped.llegada.toString()).split("/")[0])
    console.log("this.noches",this.noches)
  }
  getAdicionales(): void {
    this.adicionalService.getAdicionales()
                        .subscribe((adicional)=>{
                          for(let i=0; i<adicional.length;i++)
                          {
                            this.adicionalArray.push(adicional[i])
                          }
                        })

  }

  servicioAdicional(event,adicional,descripcion){
    if(event.checked)
    {     
      this.huesped.tarifa=adicional+this.huesped.tarifa
      this.huesped.pendiente=this.huesped.pendiente+adicional
      this.huesped.porPagar=this.huesped.porPagar+adicional
    }
    else if(!event.checked){
      this.huesped.tarifa=this.huesped.tarifa-adicional
      this.huesped.pendiente=this.huesped.pendiente-adicional
      this.huesped.porPagar=this.huesped.porPagar-adicional
}
    
  }

  fechaSeleccionadaFinal(event){
    this.fromDate = event

    this.comparadorInicial = new Date(event.year,event.month-1,event.day)
  
    this.fechaFinalBloqueo= event.day+" de "+this.i18n.getMonthFullName(event.month)+" del "+event.year
  
    if(this.comparadorInicial>this.comparadorFinal)
    {
    }
    else if(this.comparadorInicial<this.comparadorFinal)
    {
      
    }
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
ngOnDestroy(): void {
  this.subscriptions.forEach(sb => sb.unsubscribe());
}
}
