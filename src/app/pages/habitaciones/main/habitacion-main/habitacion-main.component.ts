import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { MatTableDataSource } from '@angular/material/table';
import { Router } from '@angular/router';
import { ModalDismissReasons, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { Subscription } from 'rxjs';
import { AlertsComponent } from 'src/app/main/alerts/alerts.component';
import { GroupingState, PaginatorState, SortState } from 'src/app/_metronic/shared/crud-table';
import { AgregarInventarioComponent } from '../../components/agregar-inventario/agregar-inventario.component';
import { AltaHabitacionComponent } from '../../components/alta-habitacion/alta-habitacion.component';
import { Habitacion } from '../../_models/habitacion';
import { HabitacionesService } from '../../_services/habitaciones.service';
import { FileUploadService } from '../../_services/file.upload.service';
import { map } from 'rxjs/operators';

@Component({
  selector: 'app-habitacion-main',
  templateUrl: './habitacion-main.component.html',
  styleUrls: ['./habitacion-main.component.scss']
})
export class HabitacionMainComponent implements OnInit {
  //DOM
  isLoading: boolean;
  blockedTabled:boolean=false;
  reloading:boolean=false

  //Forms
  filterGroup: FormGroup;
  searchGroup: FormGroup;

  //Filtros
  paginator: PaginatorState;
  sorting: SortState;
  grouping: GroupingState;

  //Modal
  closeResult: string;
  habitacionesporCodigo:Habitacion[]=[]

  //Models
  habitacionesArr:any[]=[]

  //Files
  fileList:any

  /**Table */
  dataSource = new MatTableDataSource<any[]>();
  displayedColumns = ['Codigo', 'Capacidad', 'Tipo','Inventario', 'Acciones'];

  private subscriptions: Subscription[] = [];

  constructor(
    public uploadService : FileUploadService,
    public fb : FormBuilder,
    public habitacionService:HabitacionesService,
    public modalService :NgbModal,
    private router:Router
  ) {
    }

  ngOnInit(): void {

    this.getImagenesHabitaciones();

    this.habitacionService.fetch()
    this.getHabitaciones(false)

    const sb = this.habitacionService.isLoading$.subscribe((res) => this.isLoading = res);
    this.subscriptions.push(sb);

    this.grouping = this.habitacionService.grouping;
    this.paginator = this.habitacionService.paginator;
    this.sorting = this.habitacionService.sorting;
    this.sorting.column = 'Codigo'
    this.sorting.direction = 'asc'
  }

  getImagenesHabitaciones(){
    this.uploadService.getAllFiles().snapshotChanges().pipe(
      map(changes =>
        changes.map(c => ({ key: c.payload.key, ...c.payload.val() }))
      )
    ).subscribe(fileUploads => {
      this.fileList = fileUploads;
    });
  }

  getHabitaciones(reloading:boolean){
    
    if(!reloading)
    {
      this.blockedTabled=true
    }
    if(reloading){
      this.reloading=true
    }

    const sb = this.habitacionService.getCodigohabitaciones().subscribe(
      (value)=>{
        const sb = this.habitacionService.getAll().subscribe((habitaciones)=>{
          this.habitacionesporCodigo = habitaciones.reduce(function (r, a) {
                      r[a.Codigo] = r[a.Codigo] || [];
                      r[a.Codigo].push(a);
                      return r;
                  }, Object.create(null));

          this.habitacionesArr=[] // limpia array de habitaciones


          for(let i=0;i<value.length;i++){
            let inventario = 0
            for(let g=0;g<habitaciones.length;g++)
            {
              if(value[i].toString()==habitaciones[g].Codigo){
                inventario++
              }
            }

            let array = {
              Codigo:'',
              Capacidad:1,
              Tipo:'',
              Inventario:1,
              Amenidades:[],
              Camas:1,
              Descripcion:'',
              Personas:1,
              Personas_Extra:1,
              Vista:'',
              Tipos_Camas:[],
              Orden:1
            }
              array.Codigo=this.habitacionesporCodigo[value[i].toString()][0].Codigo
              array.Capacidad = this.habitacionesporCodigo[value[i].toString()][0].Personas
              array.Amenidades = this.habitacionesporCodigo[value[i].toString()][0].Amenidades
              array.Camas = this.habitacionesporCodigo[value[i].toString()][0].Camas
              array.Tipo = this.habitacionesporCodigo[value[i].toString()][0].Tipo
              array.Inventario =inventario
              array.Descripcion = this.habitacionesporCodigo[value[i].toString()][0].Descripcion
              array.Personas = this.habitacionesporCodigo[value[i].toString()][0].Personas
              array.Personas_Extra = this.habitacionesporCodigo[value[i].toString()][0].Personas_Extra
              array.Vista=  this.habitacionesporCodigo[value[i].toString()][0].Vista
              array.Tipos_Camas=  this.habitacionesporCodigo[value[i].toString()][0].Tipos_Camas
              array.Orden=  this.habitacionesporCodigo[value[i].toString()][0].Orden

              this.habitacionesArr.push(array)
              this.blockedTabled=false
              this.reloading=false
          }
          this.dataSource.data=this.habitacionesArr
        },
        (error)=>{

        })

        this.subscriptions.push(sb)
    },
    (error)=>{

    })

    this.subscriptions.push(sb)
  }

  add(habitacion:any){
    const modalRef = this.modalService.open(AgregarInventarioComponent,{ size: 'md', backdrop:'static' })
    modalRef.componentInstance.habitacion=habitacion
    modalRef.result.then((result) => {
      this.habitacionesArr=[]
      this.getHabitaciones(false);
      this.habitacionService.fetch();
      this.closeResult = `Closed with: ${result}`;
      }, (reason) => {
          this.closeResult = `Dismissed ${this.getDismissReason(reason)}`;
      });  }



  altaDehabitacion(){
    const modalRef=this.modalService.open(AltaHabitacionComponent,{ size: 'lg', backdrop:'static' })
    modalRef.componentInstance.edicion=false
  }

  edit(habitacion:Habitacion){
    const imagen = this.fileList.filter(c=>c.name.split('.')[0] == habitacion.Codigo)
    const modalRef=this.modalService.open(AltaHabitacionComponent,{ size: 'lg', backdrop:'static' })
    modalRef.componentInstance.habitacion=habitacion
    modalRef.componentInstance.edicion=true
    modalRef.componentInstance.imagen=imagen[0].url
    modalRef.result.then((result)=>{
      this.habitacionesArr=[]
      this.getHabitaciones(false);
      this.closeResult = `Closed with: ${result}`;
    }, (reason) => {
        this.fileList=[]
        this.getImagenesHabitaciones()
        this.closeResult = `Dismissed ${this.getDismissReason(reason)}`;
    });

  }

  popDelete(habitacion:Habitacion){
    const modalRef=this.modalService.open(AlertsComponent,{ size: 'sm', backdrop:'static' })
        modalRef.componentInstance.alertsHeader='Advertencia'
        modalRef.componentInstance.mensaje='Esta seguro que quiere eliminar esta habitación'

        modalRef.result.then((result) => {
          if(result=='Aceptar')
          {
            this.isLoading=true
            const sb = this.habitacionService.buscarHabitacion(habitacion).subscribe(
              (value)=>{
                if(value.length!=0){
                  const modalRef=this.modalService.open(AlertsComponent,{ size: 'sm', backdrop:'static' })
                        modalRef.componentInstance.alertsHeader='Error'
                        modalRef.componentInstance.mensaje='Existen reservaciones que fueron asignadas a esta habitacion aun asi desea eliminarla?'
                        modalRef.result.then((result) => {
                          if(result=='Aceptar') {
                            this.deletehab(habitacion._id)
                          }else
                          this.closeResult = `Closed with: ${result}`;
                          }, (reason) => {
                              this.closeResult = `Dismissed ${this.getDismissReason(reason)}`;
                          });
                          this.isLoading=false
                }else{
                  this.deletehab(habitacion._id)
                }
              })
          }
          this.closeResult = `Closed with: ${result}`;
          }, (reason) => {
              this.closeResult = `Dismissed ${this.getDismissReason(reason)}`;
          });
  }

  deletehab(_id:string){
    this.isLoading=true
    const sd =  this.habitacionService.deleteHabitacion(_id).subscribe(
      (value)=>{
        this.isLoading=false
        const modalRef = this.modalService.open(AlertsComponent,{ size: 'sm', backdrop:'static' })
        modalRef.componentInstance.alertHeader = 'Exito'
        modalRef.componentInstance.mensaje='Habitación Eliminada con éxito'
        modalRef.result.then((result) => {
          this.habitacionesArr=[]
          this.getHabitaciones(false);
          this.closeResult = `Closed with: ${result}`;
          }, (reason) => {
              this.closeResult = `Dismissed ${this.getDismissReason(reason)}`;
          });
          setTimeout(() => {
            modalRef.close('Close click');
          },4000)
          this.habitacionService.fetch();
      },
      (error)=>{
        this.isLoading=false
        const modalRef = this.modalService.open(AlertsComponent,{ size: 'sm', backdrop:'static' })
        modalRef.componentInstance.alertHeader = 'Exito'
        modalRef.componentInstance.mensaje='No se pudo Eliminar la habitación intente de nuevo mas tarde'
        modalRef.result.then((result) => {
          this.closeResult = `Closed with: ${result}`;
          }, (reason) => {
              this.closeResult = `Dismissed ${this.getDismissReason(reason)}`;
          });
          setTimeout(() => {
            modalRef.close('Close click');
          },4000)
      })
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
    this.habitacionService.patchState({ sorting });
  }

  // pagination
  paginate(paginator: PaginatorState) {
    this.habitacionService.patchState({ paginator });
  }

  private getDismissReason(reason: any): string {
    if (reason === ModalDismissReasons.ESC) {
        return 'by pressing ESC';
    } else if (reason === ModalDismissReasons.BACKDROP_CLICK) {
        return 'by clicking on a backdrop';
    } else {
        return  `with: ${reason}`;
    }
  }

  ngOnDestroy() {
    this.subscriptions.forEach((sb) => sb.unsubscribe());
  }

}
