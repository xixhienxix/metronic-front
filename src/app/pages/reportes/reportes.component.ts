import { Component, OnInit } from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Huesped} from './_models/customer.model'
import { Subject, Subscription } from 'rxjs';
import { NgPaginationNumber } from 'src/app/_metronic/shared/crud-table/components/paginator/ng-pagination/ng-pagination.component';
import { HuespedService } from './_services';
import {Injectable} from '@angular/core'
import { Foliador } from './_models/foliador.model';
import { map } from 'rxjs/operators';
import {environment} from '../../../environments/environment'
import { Bloqueo } from './_models/bloqueo.model';


@Component({
  selector: 'app-reportes',
  templateUrl: './reportes.component.html',
  // styleUrls: ['./reportes.component.scss']
})
@Injectable({
  providedIn: 'root'
})
export class ReportesComponent implements OnInit {

  private subscriptions : Subscription[]=[]
  sb:any

  constructor(private http:HttpClient) 
  { 
  }

  menssage : any;
  private huesped:Huesped[]=[];
  private postsUpdated = new Subject<Huesped[]>();
  private folios:Foliador[]=[];

  ngOnDestroy(){
    this.subscriptions.forEach((sb)=>sb.unsubscribe());
  }

  getPostUpdateListener() {
    return this.postsUpdated.asObservable();
  }




  actualizaEstatusHabitacion(id:number)
  {
  const sb =  this.http
    .post<{ message: string }>(environment.apiUrl+"/reportes/habitacion/estatus/:id", id)
    .subscribe(responseData => {
      console.log(responseData.message);
    });
    
    this.subscriptions.push(sb);

  }




  ngOnInit(): void {
  }

}
