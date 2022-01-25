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
import { Component, OnInit, ViewEncapsulation } from '@angular/core';
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
import { DivisasService } from '../../parametros/_services/divisas.service';
import { HuespedService } from '../_services';
import { HistoricoService } from '../_services/historico.service';
import { VerFolioComponent } from './components/ver-folio/ver-folio.component';


@Component({
  selector: 'app-clientes',
  templateUrl: './clientes.component.html',
  styleUrls: ['./clientes.component.scss'],

})

export class ClientesComponent implements OnInit {

  /*Forms*/
  filterGroup: FormGroup;
  searchGroup:FormGroup;

  /**Models */
  clientes:Historico[]=[]
  public estatusArray:Estatus[]=[];
  public codigoCuarto:Habitaciones[]=[];
  public origenArray:Origen[]=[];
  public cliente:Historico;
  public folios:Foliador[]=[];

  /**MAT TABLE */
  dataSource = new MatTableDataSource<Historico>();
  displayedColumns:string[] = ['cancelar','folio','llegada','salida','nombre','habitacion','cuarto','edit']

  /**Helpers */
  isLoading: boolean;
  closeResult: string;

    /**Subscription */
    subscription:Subscription[]=[]

  private subscriptions: Subscription[] = []; 



  constructor(
    public clientesServices : ClientesService,
    public modalService:NgbModal,
    public fb : FormBuilder,
    public divisasService : DivisasService,
    public customerService: HuespedService,
    public historicoService : HistoricoService
    ) 
    {  
      const sb = this.historicoService.getNotification().subscribe(data=>{
        if(data)
        {
          this.getAll();
          this.cliente=data
        }
      });
      this.subscription.push(sb)
    }

  ngOnInit(): void {
    this.getAll();
    // this.filterForm();
    this.getClientes();
  }

  getAll(){
    const sb = this.historicoService.getAll().subscribe(
      (value)=>{
       
        this.dataSource.data=value
        this.clientes=value
        if(this.cliente){
          this.historicoService.setCurrentClienteValue=this.cliente
        }
      },
      (error)=>{
        console.log(error)
      })
  }



  getClientes(){
    const sb = this.clientesServices.getClientes().subscribe(
      (value:Historico[])=>{
        this.dataSource.data=value

      },
      (error)=>{

      },
      ()=>{})
      this.subscription.push(sb)
  }

  verFolio(row:any){
    let clientes
    
    clientes = this.clientes.filter(cliente=>cliente.folio==row.folio)
    
    for(let i=0;i<this.clientes.length;i++)
    {
      this.historicoService.setCurrentClienteValue=clientes[0]
    }

    if(this.historicoService.getCurrentClienteValue!=undefined)
    {    
      const modalRef = this.modalService.open(VerFolioComponent,{size:'md',backdrop: 'static'})
    }
  }
  
  ngOnDestroy():void
  {
    this.subscription.forEach(sb=>sb.unsubscribe())
  }
  


 
}
