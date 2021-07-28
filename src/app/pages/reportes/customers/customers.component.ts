// tslint:disable:no-string-literal
import { Component, NgModule, OnDestroy, OnInit, ɵɵtrustConstantResourceUrl,ViewChild} from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Subscription } from 'rxjs';
import { debounceTime, distinctUntilChanged, elementAt } from 'rxjs/operators';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { HuespedService } from '../_services';
import {FoliosService} from '../_services/folios.service'
import { ReportesComponent } from '../reportes.component';
// import { Status } from "./estatus.enum";
import { Foliador } from '../_models/foliador.model';
import { HttpClient } from "@angular/common/http";
import {environment} from "../../../../environments/environment"
import { map, filter, switchMap } from 'rxjs/operators';
import { ModalDismissReasons} from '@ng-bootstrap/ng-bootstrap';
import {Huesped} from '../_models/customer.model'

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
import { DeleteHuespedModalComponent } from './components/delete-customer-modal/delete-customer-modal.component';
import { DeleteHuespedesModalComponent } from './components/delete-customers-modal/delete-customers-modal.component';
import { UpdateCustomersStatusModalComponent } from './components/update-customers-status-modal/update-customers-status-modal.component';
import { FetchCustomersModalComponent } from './components/fetch-customers-modal/fetch-customers-modal.component';
import { EditReservaModalComponent } from './components/edit-reserva-modal/edit-reserva-modal/edit-reserva-modal.component';
import { CompileShallowModuleMetadata } from '@angular/compiler';
import { isJSDocThisTag } from 'typescript';
import { NuevaReservaModalComponent } from './components/nueva-reserva-modal/nueva-reserva-modal.component';
import { HabitacionesService } from '../_services/habitaciones.service';
import { Habitaciones } from '../_models/habitaciones.model';
import { DisponibilidadService } from '../_services/disponibilidad.service'
import { EstatusService } from '../_services/estatus.service'
import { HistoricoService } from '../_services/historico.service'
import { Estatus } from '../_models/estatus.model';
import { BloqueoReservaModalComponent } from './components/bloqueo-customer-modal/bloqueo-reserva-modal.component';
import { ConfirmationModalComponent } from './components/helpers/confirmation-modal/confirmation-modal/confirmation-modal.component';

@Component({
  selector: 'app-customers',
  templateUrl: './customers.component.html',
  styleUrls: ['./customers.component.scss'],
})
export class CustomersComponent

  implements
  OnInit,
  OnDestroy,
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
  IFilterView {

    @ViewChild('exito') exito: null;
    @ViewChild('error') error: null;
    @ViewChild('dialog') dialog: null;
    @ViewChild('option') option: null;

  paginator: PaginatorState;
  sorting: SortState;
  grouping: GroupingState;
  isLoading: boolean;
  filterGroup: FormGroup;
  searchGroup: FormGroup;
  closeResult: string;

  // foliador:Foliador;
  public folios:Foliador[]=[];
  public cuartos:Habitaciones[]=[];
  public estatusDesc:Estatus[]=[];
  public estatusArray:Estatus[]=[];
  public foliosprueba1: [];
  private subscriptions: Subscription[] = []; // Read more: => https://brianflove.com/2016/12/11/anguar-2-unsubscribe-observables/
  private foliosSub:Subscription;
  public codigoCuarto:Habitaciones[]=[];

  oldDropValue:string

  constructor(
    private fb: FormBuilder,
    private modalService: NgbModal,
    public customerService: HuespedService,
    public historicoService: HistoricoService,
    public postService : ReportesComponent,
    public foliosService : FoliosService,
    public habitacionesService : HabitacionesService,
    private http: HttpClient,
    public habitacionService : HabitacionesService,
    public disponibilidadSercice : DisponibilidadService,
    public estatusService : EstatusService,

  ) {

  }


  // angular lifecircle hooks
  ngOnInit(): void {
    this.postService.getPost();
    this.getFolios();
    this.getCuartos();
    this.getEstatus();
    this.getTipoCuarto();
    this.filterForm();
    this.searchForm();
    this.customerService.fetch();
    this.grouping = this.customerService.grouping;
    this.paginator = this.customerService.paginator;
    this.sorting = this.customerService.sorting;
    const sb = this.customerService.isLoading$.subscribe(res => this.isLoading = res);
    this.subscriptions.push(sb);
    this.sorting.direction = 'desc';
  }




  ngOnDestroy() {
    this.subscriptions.forEach((sb) => sb.unsubscribe());
  }

  getEstatus(): void {
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
                            // this.estatusDesc.push(estatus[i].estatus)
                            this.estatusArray=estatus
                          }
                        })

  }

  getCuartos(): void {
    this.habitacionesService.gethabitaciones()
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
  }


  habValue($event)
  {
    // this.huesped.habitacion = $event.target.options[$event.target.options.selectedIndex].text;
    // console.log("this.cuarto",this.cuarto)
  }

  getFolios(): void {

    this.foliosService.getFolios()
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
                        .subscribe((folios)=>{
                          this.folios=(folios)
                        })
  }

  getTipoCuarto(): void {

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



  // filtration
  filterForm() {
    this.filterGroup = this.fb.group({
      estatus: [''],
      habitacion: [''],
      searchTerm: [''],
    });
    this.subscriptions.push(
      this.filterGroup.controls.estatus.valueChanges.subscribe(() =>
        this.filter()
      )
    );
    this.subscriptions.push(
      this.filterGroup.controls.habitacion.valueChanges.subscribe(() => this.filter())
    );
  }

  filter() {
    const filter = {};
    const estatus = this.filterGroup.get('estatus').value;
    if (estatus) {
      filter['estatus'] = estatus;
    }

    const habitacion = this.filterGroup.get('habitacion').value;
    if (habitacion) {
      filter['habitacion'] = habitacion;
    }
    this.customerService.patchState({ filter });
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
    this.customerService.patchState({ searchTerm });
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
    this.customerService.patchState({ sorting });
  }

  // pagination
  paginate(paginator: PaginatorState) {
    this.customerService.patchState({ paginator });
  }

  // form actions
  create() {
    this.edit(undefined);
  }

  crearBloqueo() {
    this.bloqueo();
  }

  bloqueo() {
      const modalRef = this.modalService.open(BloqueoReservaModalComponent, { size: 'md' });
      modalRef.result.then( () =>
      this.customerService.fetch(),
      () => { }

    );
    }



   edit(id: number) {

    if(id==undefined)
    {
      const modalRef = this.modalService.open(NuevaReservaModalComponent, { size: 'md' });
      modalRef.componentInstance.folios = this.folios
      modalRef.componentInstance.id = id;

      modalRef.result.then( () =>
      this.customerService.fetch(),
      () => { }

    );
    }
    else
    {
      const modalRef = this.modalService.open(EditReservaModalComponent, { size: 'md' });

    modalRef.componentInstance.folio = id;
    modalRef.componentInstance.id = id;
    modalRef.result.then(() =>
      this.customerService.fetch(),
      () => { }
    );
    }
  }

  delete(id: number) {
    const modalRef = this.modalService.open(DeleteHuespedModalComponent);
    modalRef.componentInstance.id = id;
    modalRef.result.then(() => this.customerService.fetch(), () => { });
  }

  deleteSelected() {
    const modalRef = this.modalService.open(DeleteHuespedModalComponent);
    modalRef.componentInstance.ids = this.grouping.getSelectedRows();
    modalRef.result.then(() => this.customerService.fetch(), () => { });
  }

  updateStatusForSelected() {
    const modalRef = this.modalService.open(UpdateCustomersStatusModalComponent);
    modalRef.componentInstance.ids = this.grouping.getSelectedRows();
    modalRef.result.then(() => this.customerService.fetch(), () => { });
  }

  fetchSelected() {
    const modalRef = this.modalService.open(FetchCustomersModalComponent);
    modalRef.componentInstance.ids = this.grouping.getSelectedRows();
    modalRef.result.then(() => this.customerService.fetch(), () => { });
  }

  // estatus(elem: HTMLElement,value:number) {
  //   console.log(elem.className, 'before');
  //   elem.className = 'btn-warning';
  //   console.log(elem.className, 'after');
  // }


  estatus(elem: HTMLElement,estatus:number)
  {
    if(estatus==1)
    {
      console.log(estatus, 'antes')
      elem.className='btn'
      elem.style.backgroundColor="#82E428"
      elem.style.fontWeight="bold"
      elem.style.color="black"
      //HUESED EN CASA

    }else if(estatus==2)
    {
      console.log(estatus, 'antes')
      elem.className='btn'
      elem.style.backgroundColor="#EBEB6C"
      elem.style.fontWeight="bold"
      elem.style.color="black"
      //RESERVA SIN PAGO

    }else if(estatus==3)
    {
      console.log(estatus, 'antes')
      elem.className='btn'
      elem.style.backgroundColor="#27A9FF"
      elem.style.fontWeight="bold"
      elem.style.color="white"
      //RESERVA CONFIRMADA

    }else if(estatus==4)
      {
      console.log(estatus, 'antes')
      elem.className='btn'
      elem.style.backgroundColor="#fb7f8c"
      elem.style.fontWeight="bold"
      elem.style.color="white"
      }
    //CHECK-OUT

    else if(estatus==5)
    {
      console.log(estatus, 'antes')
      elem.className='btn'
      elem.style.backgroundColor="#F97FF9"
      elem.style.fontWeight="bold"
      elem.style.color="white"
  //USO INTERNO

    }else if(estatus==6)
    {
      console.log(estatus, 'antes')
      elem.className='btn'
      elem.style.backgroundColor="#D1D1C9"
      elem.style.fontWeight="bold"
      elem.style.color="black"
      //BLOQUEO

    }else if(estatus==7)
    {
      console.log(estatus, 'antes')
      elem.className='btn'
      elem.style.backgroundColor="rgb(55, 222, 224)"
      elem.style.fontWeight="bold"
      elem.style.color="black"
   //RESERVA TEMPORAL
    }


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

  // cambiaEstatus(huesped:Huesped)
  // {
  //   this.customerService.updateHuesped(huesped)
  //   .subscribe(
  //    ()=>
  //    {
  //     this.modalService.open(this.exito,{size:'sm'}).result.then((result) => {
  //       this.closeResult = `Closed with: ${result}`;
  //       }, (reason) => {
  //           this.closeResult = `Dismissed ${this.getDismissReason(reason)}`;
  //       });
  //       this.customerService.fetch();
  //   },
  //    (err)=>
  //    {
  //      console.log(err.message)
  //     this.modalService.open(this.error,{size:'sm'}).result.then((result) => {
  //       this.closeResult = `Closed with: ${result}`;
  //       }, (reason) => {
  //           this.closeResult = `Dismissed ${this.getDismissReason(reason)}`;
  //       });     },
  //    ()=>{

  //    }

  //  )
  // }

  getDismissReason(reason: any): string {
    if (reason === ModalDismissReasons.ESC) {
        return 'by pressing ESC';
    } else if (reason === ModalDismissReasons.BACKDROP_CLICK) {
        return 'by clicking on a backdrop';
    } else {
        return  `with: ${reason}`;
    }
}

oldDropdownValue(event)
{
  this.oldDropValue = event.value
}

openDialog(huesped:Huesped) {
  const modalRef = this.modalService.open(ConfirmationModalComponent,
    {
      scrollable: true,
      windowClass: 'myCustomModalClass',
      // keyboard: false,
      // backdrop: 'static'
      // backdrop: If `true`, the backdrop element will be created for a given modal. Alternatively, specify `’static’` for a backdrop that doesn’t close the modal on click. The default value is `true`.
      // beforeDismiss: Callback right before the modal will be dismissed.
      // centered: If `true`, the modal will be centered vertically. The default value is `false`.
      // container: A selector specifying the element all-new modal windows should be appended to. If not specified, it will be `body`.
      // keyboard: If `true`, the modal will be closed when the `Escape` key is pressed. The default value is `true`.
      // scrollable: Scrollable modal content (false by default).
      // size: Size of a new modal window. ‘sm’ | ‘lg’ | ‘xl’ | string;
      // windowClass: A custom class to append to the modal window.
      // backdropClass: A custom class to append to the modal backdrop.
      // Using componetInstance we can pass data object to modal contents.
    });


  modalRef.componentInstance.huesped = huesped;
  modalRef.result.then((result) => {
    console.log(result);
  }, (reason) => {
  });
  }
}
