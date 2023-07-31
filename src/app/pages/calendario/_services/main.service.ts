import { Injectable } from '@angular/core';
import { ParametrosServiceService } from '../../parametros/_services/parametros.service.service';
import {DateTime} from 'luxon'
import { takeUntil } from 'rxjs/operators';
import { BehaviorSubject, Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class MainService {

  /**Fecha */
  today:DateTime

  public mainSubject = new BehaviorSubject<any[]>(null)
  private ngUnsubscribe = new Subject<void>();
  private subject =new Subject<any>();

  constructor(public parametrosService : ParametrosServiceService) { 

    this.today = DateTime.now().setZone(this.parametrosService.getCurrentParametrosValue.zona)
    this.getDatest(this.today);
  }

  get currentCuentaValue(): any[] {
    return this.mainSubject.value;
  }

  set currentCuentaValue(user: any[]) {
    this.mainSubject.next(user);
  }

  sendNotification(value:any)
  {
    this.subject.next({text:value});
  }
  getNotification(){
    return this.subject.asObservable();
}

  getDatest(today:DateTime){
   let configTabla : {
    displayedColumns:number
   }

    var date = new Date(today.year, today.month-1, today.day);
    var end =  new Date(today.year,0,1);
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
    }
    configTabla.displayedColumns = array.length

    return configTabla
  }
}
