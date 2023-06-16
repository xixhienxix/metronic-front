import { Component, OnInit } from '@angular/core';
import {MatButtonToggleGroup} from '@angular/material/button-toggle';
import { MatTableDataSource } from '@angular/material/table';
import { Observable, Subject, Subscription } from 'rxjs';
import { ParametrosServiceService } from '../parametros/_services/parametros.service.service';
import { HabitacionesService } from './_services/habitaciones.service';
import { DateTime} from 'luxon'
import { AlertsComponent } from 'src/app/main/alerts/alerts.component';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { takeUntil } from 'rxjs/operators';
import { DisponibilidadService } from '../reportes/_services/disponibilidad.service';

export interface ListaHabitaciones {
  Habitacion: string;
}

@Component({
  selector: 'app-calendario',
  templateUrl: './calendario.component.html',
  styleUrls: ['./calendario.component.scss']
})

export class CalendarioComponent implements OnInit {

  /**Fecha */
  today:DateTime
  /** Arrays*/
  tables = [0];
  habitaciones: ListaHabitaciones[] = [];

  /**Subscription */
  subscriptions:Subscription[]
  private ngUnsubscribe = new Subject<void>();


  displayedColumns: string[] = [];
  columnsToDisplay: string[] = [];

  dataSource = new MatTableDataSource<ListaHabitaciones>();


  constructor(
    public habitacionService : HabitacionesService,
    public parametrosService : ParametrosServiceService,
    public modalService: NgbModal,
    public disponibilidadService : DisponibilidadService
    ) {
      
      this.today = DateTime.now().setZone('America/Mexico_City')
    // this.today = DateTime.now().setZone(this.parametrosService.getCurrentParametrosValue.zona)

    this.displayedColumns.length = this.getDatest();

    this.displayedColumns.fill('filler');

    // The first two columns should be position and name; the last two columns: weight, symbol
    this.displayedColumns[0] = 'Habitacion';
  }

  ngOnInit(): void {
    this.getDisponibilidad();
    this.getParametros();
    this.getHabitaciones();
  }

  async getParametros(): Promise<any>{

    return new Promise((resolve, reject) => {

      this.parametrosService.getParametros().pipe(takeUntil(this.ngUnsubscribe)).subscribe(
        (value)=>{
          this.today = DateTime.now().setZone(this.parametrosService.getCurrentParametrosValue.zona)
          this.displayedColumns.length = this.getDatest();
          resolve(this.getDatest())
        },
        (error)=>{
          reject('No se pudieron cargar los Parametros refresque la pagina')
        })
 
 
   })

  }

  getDisponibilidad(){
    this.disponibilidadService.getDisponibilidadAnual(this.today.day,this.today.month,this.today.year).subscribe(
      (value)=>{
        console.log(value)
      },
      (error)=>{
        console.log(error)
      })

  }

  getHabitaciones(){
    this.habitacionService.getCodigosDeCuarto().pipe(takeUntil(this.ngUnsubscribe)).subscribe(
      (value:string[])=>{
        
        for(let i=0; i<value.length; i++){
          let obj={
            Habitacion:''
          }
          obj.Habitacion=(value[i])
            this.habitaciones.push(obj)
        }
      this.dataSource.data=this.habitaciones
      },
      (error)=>{
        console.log(error)
      })
  }

  //MOVER FUNCION A UN SERVICIO Y EN EL CONSTRUCTOR DISPARAR ESE SERVICIO CON TRIGGET A PARAMETROS ZONA y ASI LLEGAR LAS COLUMNAS EN
  getDatest(){
    var date = new Date(this.today.year, this.today.month-1, this.today.day);
    var end =  new Date(this.today.year,0,1);
    end.setFullYear(end.getFullYear() + 1);
    var array = [];
    var obj
    
    while(date < end){

      obj = {
        Dia:0,
        Mes:0,
        Ano:0,
        Semana:''
      }

      obj.Dia=date.getDate()
      obj.Mes=date.getMonth()+1;
      obj.Ano=date.getFullYear();
      obj.Semana= (date.getDay() == 0) ? 'Dom' : (date.getDay() == 1) ? 'Lun' : (date.getDay() == 2) ? 'Mar' : (date.getDay() == 3) ? 'Mie' : (date.getDay() == 4) ? 'Jue' : (date.getDay() == 5) ? 'Vie' : 'Sab';

        array.push(obj);
        date.setDate(date.getDate() + 1)
        this.columnsToDisplay.push(obj.Semana +'/'+ obj.Dia);
    }
    return array.length
    // this.displayedColumns.length = array.length
  }


  ngOnDestroy() {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
}

}




