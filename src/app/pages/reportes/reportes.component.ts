import { Component, OnInit } from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Huesped} from './_models/customer.model'
import { Subject } from 'rxjs';
import { NgPaginationNumber } from 'src/app/_metronic/shared/crud-table/components/paginator/ng-pagination/ng-pagination.component';
import { HuespedService } from './_services';
import {Injectable} from '@angular/core'
import { Foliador } from './_models/foliador.model';
import { map } from 'rxjs/operators';
import {environment} from '../../../environments/environment'


@Component({
  selector: 'app-reportes',
  templateUrl: './reportes.component.html',
  // styleUrls: ['./reportes.component.scss']
})
@Injectable({
  providedIn: 'root'
})
export class ReportesComponent implements OnInit {

  constructor(private http:HttpClient) { }

  private huesped:Huesped[]=[];
  private postsUpdated = new Subject<Huesped[]>();
  private folios:Foliador[]=[];

  getPost(){
    this.http
    .get<{huesped:Huesped[]}>
    (environment.apiUrl + '/reportes/huesped')
    .subscribe( (postHuesped) => {
      this.huesped = postHuesped.huesped
    });

  }
  getPostUpdateListener() {
    return this.postsUpdated.asObservable();
  }

  addPost(
          id:number,
          folio:number,
          adultos:number,
          ninos:number,
          nombre:string,
          estatus:number,
          llegada:string,
          salida:string,
          noches:number,
          tarifa:number,
          porPagar:number,
          pendiente:number,
          origen:string,
          habitacion:number,
          telefono:string,
          email:string,
          motivo:string,
          fechaNacimiento:string,
          trabajaEn:string,
          tipoDeID:string,
          numeroDeID:string,
          direccion:string,
          pais:string,
          ciudad:string,
          codigoPostal:string,
          lenguaje:string) {
    const post: Huesped = {id:id,folio:folio,adultos:adultos,
      ninos:ninos,nombre:nombre, estatus:estatus,
      llegada:llegada,salida:salida,
      noches:noches,tarifa:tarifa,porPagar:porPagar,
      pendiente:pendiente,origen:origen,habitacion:habitacion,
      telefono:telefono,email:email,motivo:motivo,
      fechaNacimiento:fechaNacimiento,trabajaEn:trabajaEn,
      tipoDeID:tipoDeID,numeroDeID:numeroDeID,direccion:direccion,pais:pais,ciudad:ciudad,codigoPostal:codigoPostal,lenguaje:lenguaje
    };
    this.http
      .post<{ message: string }>(environment.apiUrl+"/reportes/huesped", post)
      .subscribe(responseData => {
        console.log(responseData.message);
        this.huesped.push(post);
        this.postsUpdated.next([...this.huesped]);
      });
  }

  actualizaEstatusHabitacion(id:number)
  {
    this.http
    .post<{ message: string }>(environment.apiUrl+"/reportes/habitacion/estatus/:id", id)
    .subscribe(responseData => {
      console.log(responseData.message);
    });
  }




  ngOnInit(): void {
  }

}
