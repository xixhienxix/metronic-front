import {
  GroupingState,
  PaginatorState,
  SortState,
  ICreateAction,
  IEditAction,
  IDeleteAction,
  IDeleteSelectedAction,
  IFetchSelectedAction,
  IUpdateStatusForSelectedAction,
  ISortView,
  IFilterView,
  IGroupingView,
  ISearchView,
} from '../../../_metronic/shared/crud-table';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Estatus } from '../_models/estatus.model';
import { Habitaciones } from '../_models/habitaciones.model';
import { Origen } from '../_models/origen.model';
import { ClientesService } from '../_services/clientes.service';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { Huesped } from '../_models/customer.model';
import { ConfirmationModalComponent } from '../customers/components/helpers/confirmation-modal/confirmation-modal/confirmation-modal.component';
import { catchError, debounceTime, distinctUntilChanged, first } from 'rxjs/operators';
import { EditReservaModalComponent } from '../customers/components/edit-reserva-modal/edit-reserva-modal.component';
import { NuevaReservaModalComponent } from '../customers/components/nueva-reserva-modal/nueva-reserva-modal.component';
import { Foliador } from '../_models/foliador.model';
import { of } from 'rxjs/internal/observable/of';
import { Subscription } from 'rxjs';
import { MatTableDataSource } from '@angular/material/table';
import { Historico } from '../_models/historico.model';


@Component({
  selector: 'app-clientes',
  templateUrl: './clientes.component.html',
  styleUrls: ['./clientes.component.scss']
})

export class ClientesComponent implements OnInit {

  /*Forms*/
  filterGroup: FormGroup;
  searchGroup:FormGroup;

  /**Models */
  public estatusArray:Estatus[]=[];
  public codigoCuarto:Habitaciones[]=[];
  public origenArray:Origen[]=[];
  public cliente:Historico[]=[];
  public folios:Foliador[]=[];

  /**MAT TABLE */
  dataSource = new MatTableDataSource<Historico>();
  displayedColumns:string[] = ['folio','nombre','estatus','habitacion','llegada','salida','noches']

  /**Helpers */
  isLoading: boolean;
  closeResult: string;

    /**Subscription */
    subscription:Subscription

  private subscriptions: Subscription[] = []; 



  constructor(
    public clientesServices : ClientesService,
    public modalService:NgbModal,
    public fb : FormBuilder
    ) 
    {  
      
    }


  

  ngOnInit(): void {
  this.getClientes();
  }

  getClientes(){
    this.clientesServices.getClientes().subscribe(
      (value:Historico[])=>{
        this.dataSource.data=value
      },
      (error)=>{

      },
      ()=>{})
  }

  abrirDetalle(row:any){

  }
  
  
  
  backgroundColor(estatus:string)
  {
    let color;

    for (let i=0;i<this.estatusArray.length;i++)
    {
      if(estatus==this.estatusArray[i].estatus)
      {
        color = this.estatusArray[i].color
      }
    }
    return color;
  }

 
}
