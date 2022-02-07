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
  public tipoHuespedArray:string[]=['VIP','Regular','Lista Negra'];
  public emails:string[]=[];
  public id_SocioArray:number[]=[];
  public cliente:Historico;
  public folios:Foliador[]=[];

  /**MAT TABLE */
  dataSource = new MatTableDataSource<Historico>();
  displayedColumns:string[] = ['id_Socio','nombre','telefono','email','rfc','tipoHuesped','edit']
  sorting: SortState;
  paginator: PaginatorState;


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
    this.historicoService.fetch();

    // this.filterForm();
    this.getClientes();
    this.filterForm();
    this.searchForm();
    this.sorting = this.historicoService.sorting;
    this.paginator = this.historicoService.paginator;


  }

  getAll(){
    const sb = this.historicoService.getAll().subscribe(
      (value)=>{
       
        // this.dataSource.data=value
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
        for(let i=0; i < value.length; i++){
          this.emails.push(value[i].email)
          this.id_SocioArray.push(value[i].id_Socio)
        }
      },
      (error)=>{

      },
      ()=>{})
      this.subscription.push(sb)
  }

  // filtration
  filterForm() {
    this.filterGroup = this.fb.group({
      id_Socio: [''],
      tipoHuesped: [''],
      email: [''],
      searchTerm: [''],
    });
    this.subscriptions.push(
      this.filterGroup.controls.tipoHuesped.valueChanges.subscribe(() =>
        this.filter()
      )
    );
    this.subscriptions.push(
      this.filterGroup.controls.email.valueChanges.subscribe(() => this.filter())
    );
    this.subscriptions.push(
      this.filterGroup.controls.id_Socio.valueChanges.subscribe(() => this.filter())
    );
  }
    // pagination
    paginate(paginator: PaginatorState) {
      this.customerService.patchState({ paginator });
    }

  filter() {
    const filter = {};
    const tipoHuesped = this.filterGroup.get('tipoHuesped').value;

    if (tipoHuesped) {
      filter['tipoHuesped'] = tipoHuesped;
    }

    const email = this.filterGroup.get('email').value;
    if (email) {
      filter['email'] = email;
    }

    const id_Socio = this.filterGroup.get('id_Socio').value;
    if(id_Socio){
      filter['id_Socio']=id_Socio;
    }


    this.historicoService.patchState({ filter });
  }

    // search
    searchForm() {
      this.searchGroup = this.fb.group({
        searchTerm: [''],
      });
      const searchEvent = this.searchGroup.controls.searchTerm.valueChanges
        .pipe(
          /*
        The user can type quite quickly in the input box, and that could trigger a lot of server requests. With this operator,
        we are limiting the amount of server requests emitted to a maximum of one every 150ms
        */
          debounceTime(150),
          distinctUntilChanged()
        )
        .subscribe((val) => this.search(val));
      this.subscriptions.push(searchEvent);
    }
  
    search(searchTerm: string) {
      this.historicoService.patchState({ searchTerm });
    }

    // sorting
    sort(column: string) {
      const sorting = this.sorting;
      const isActiveColumn = sorting.column === column;
      if (!isActiveColumn) {
        sorting.column = column;
        sorting.direction = 'desc';
      } else {
        sorting.direction = sorting.direction === 'desc' ? 'asc' : 'desc';
      }
      this.historicoService.patchState({ sorting });
    }

    //En Filtration and sorting

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
