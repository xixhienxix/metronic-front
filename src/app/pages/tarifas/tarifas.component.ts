import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { ModalDismissReasons, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { Subscription } from 'rxjs';
import { AlertsComponent } from 'src/app/main/alerts/alerts.component';
import { GroupingState, PaginatorState, SortState } from 'src/app/_metronic/shared/crud-table';
import { TarifaEspecialComponent } from './components/tarifa-especial/tarifa-especial.component';
import { TarifaExpressComponent } from './components/tarifa-express/tarifa-express.component';
import { Tarifas } from './_models/tarifas';
import { TarifasService } from './_services/tarifas.service';

@Component({
  selector: 'app-tarifas',
  templateUrl: './tarifas.component.html',
  styleUrls: ['./tarifas.component.scss']
})
export class TarifasComponent implements OnInit {
  @ViewChild(MatPaginator) paginator: MatPaginator;

  //DOM
  isLoading: boolean;

  //Table
  displayedColumns: string[] = ['Tarifa', 'Habitacion', 'Plan', 'Politicas','Estancia','Estado','Acciones'];
  dataSource = new MatTableDataSource<any>();
  displayedColumnsEspecial: string[] = ['Tarifa', 'Habitacion', 'Plan', 'Politicas','Estancia','Estado','Acciones'];
  dataSourceEspecial = new MatTableDataSource<any>();

  //Forms
  filterGroup: FormGroup;
  searchGroup: FormGroup;

  /**Models */
  options = [
    {name:'Lun', value:'0', checked:false},
    {name:'Mar', value:'1', checked:false},
    {name:'Mie', value:'2', checked:false},
    {name:'Jue', value:'3', checked:false},
    {name:'Vie', value:'4', checked:false},
    {name:'Sab', value:'5', checked:false},
    {name:'Dom', value:'6', checked:false}
  ]
  tarifaRackArr:any[]=[]
  tarifaRackCompleto:Tarifas[]=[]
  tarifaEspecialArray:Tarifas[]=[]

  /**Variables */
  closeResult:string

  private subscriptions: Subscription[] = [];

  constructor(
    public fb : FormBuilder,
    public tarifasService:TarifasService,
    public modalService:NgbModal
  ) { 
    this.tarifasService.fetch();
    const sb =this.tarifasService.getNotification().subscribe(data=>{
      if(data)
      {
        this.getTarifasRack();
        this.getTarifas();
      }
    });
    this.subscriptions.push(sb)
  }

  ngOnInit(): void {

    this.getTarifasRack();
    this.getTarifas();
  }

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
  }

  getTarifasRack(){
    this.tarifaRackArr=[]
    this.tarifaRackCompleto=[]
    this.tarifasService.getTarifaRack().subscribe(
      (value)=>{
        this.tarifaRackArr=[]
        if(value){
          this.tarifaRackCompleto=value
          for(let e=0;e<value.length;e++){
            for(let i=0;i<value[e].Habitacion.length;i++){
              let tarifario = {
                  Tarifa:value[e].Tarifa,
                  Habitacion:value[e].Habitacion[i],
                  Llegada:value[e].Llegada,
                  Salida:value[e].Salida,
                  Plan:value[e].Plan,
                  Politicas:value[e].Politicas,
                  EstanciaMinima:value[e].EstanciaMinima,
                  EstanciaMaxima:value[e].EstanciaMaxima,
                  TarifaRack:value[e].TarifaRack,
                  Tarifa1Persona:value[e].Tarifa1Persona,
                  Tarifa2Persona:value[e].Tarifa2Persona,
                  Tarifa3Persona:value[e].Tarifa3Persona,
                  Tarifa4Persona:value[e].Tarifa4Persona,
                  Dias:value[e].Dias,
                  Estado:value[e].Estado==true ? 'Activa' : 'No Activa'
              }
              this.tarifaRackArr.push(tarifario)
          }
        
          }
          this.dataSource.data=this.tarifaRackArr
          // this.tarifaRackArrOnly=(value)
        }

      },
      (error)=>{

      })
  }

  getTarifas(){
    this.tarifaEspecialArray=[]
    this.tarifasService.getAll().subscribe(
      (value)=>{
        for(let i=0;i<value.length;i++){
          if(value[i].Tarifa!='Tarifa Estandar'){
            this.tarifaEspecialArray.push(value[i])
          }
        }
        this.dataSourceEspecial.data=this.tarifaEspecialArray
      },
      (error)=>{

      })
  }

  promtDelete(habitacion:string){
    const modalRef = this.modalService.open(AlertsComponent,{ size: 'sm', backdrop:'static' })
        modalRef.componentInstance.alertHeader = 'Advertencia'
        modalRef.componentInstance.mensaje='Estas seguro que deseas eliminar la tarifa para la habitación '+habitacion+''          
        modalRef.result.then((result) => {
          if(result=='Aceptar')        
          {
            this.deleteTarifaRack(habitacion)

          } 
          this.closeResult = `Closed with: ${result}`;
          }, (reason) => {
              this.closeResult = `Dismissed ${this.getDismissReason(reason)}`;
          });
  }

  deleteTarifaRack(habitacion:string){
    let habitaciones
    let habitacionesArr:string[] =[]
    let tarifaRackArrOnly

    for(let i=0;i<this.tarifaRackCompleto.length;i++){
      for(let x=0;x<this.tarifaRackCompleto[i].Habitacion.length;x++){
        if(this.tarifaRackCompleto[i].Habitacion[x]==habitacion){
          if(this.tarifaRackCompleto[i].Habitacion.length==1){
            habitaciones = this.tarifaRackArr.filter(value => value.Habitacion == habitacion)
            habitacionesArr.push(habitacion)

             tarifaRackArrOnly = {
              Tarifa:habitaciones[0].Tarifa,
              Habitacion:this.tarifaRackCompleto[i].Habitacion,
              Llegada:habitaciones[0].Llegada,
              Salida:habitaciones[0].Salida,
              Plan:habitaciones[0].Plan,
              Politicas:habitaciones[0].Politicas,
              EstanciaMinima:habitaciones[0].EstanciaMinima,
              EstanciaMaxima:habitaciones[0].EstanciaMaxima,
              TarifaRack:habitaciones[0].TarifaRack,
              Tarifa1Persona:habitaciones[0].Tarifa1Persona,
              Tarifa2Persona:habitaciones[0].Tarifa2Persona,
              Tarifa3Persona:habitaciones[0].Tarifa3Persona,
              Tarifa4Persona:habitaciones[0].Tarifa4Persona,
              Dias:this.options,
              Estado:true
            }
          }else{
            habitaciones = this.tarifaRackCompleto[i].Habitacion.filter(value => value != habitacion)

            tarifaRackArrOnly = {
              Tarifa:this.tarifaRackCompleto[i].Tarifa,
              Habitacion:habitaciones,
              Llegada:this.tarifaRackCompleto[i].Llegada,
              Salida:this.tarifaRackCompleto[i].Salida,
              Plan:this.tarifaRackCompleto[i].Plan,
              Politicas:this.tarifaRackCompleto[i].Politicas,
              EstanciaMinima:this.tarifaRackCompleto[i].EstanciaMinima,
              EstanciaMaxima:this.tarifaRackCompleto[i].EstanciaMaxima,
              TarifaRack:this.tarifaRackCompleto[i].TarifaRack,
              Tarifa1Persona:this.tarifaRackCompleto[i].Tarifa1Persona,
              Tarifa2Persona:this.tarifaRackCompleto[i].Tarifa2Persona,
              Tarifa3Persona:this.tarifaRackCompleto[i].Tarifa3Persona,
              Tarifa4Persona:this.tarifaRackCompleto[i].Tarifa4Persona,
              Dias:this.options,
              Estado:true
          }
        }
      }
    }
  }
    // let habitaciones = this.tarifaRackArr.filter(value => value.Habitacion == habitacion)
    

    this.tarifasService.deleteTarifas(tarifaRackArrOnly).subscribe(
      (value)=>{
        const modalRef = this.modalService.open(AlertsComponent,{ size: 'sm', backdrop:'static' })
        modalRef.componentInstance.alertHeader = 'Exito'
        modalRef.componentInstance.mensaje='Tarifa Eliminada con éxito'          
        modalRef.result.then((result) => {
          this.closeResult = `Closed with: ${result}`;
          }, (reason) => {
              this.closeResult = `Dismissed ${this.getDismissReason(reason)}`;
          });
          setTimeout(() => {
            modalRef.close('Close click');
          },4000)
          this.tarifasService.sendNotification(true);
        
      },
      (error)=>{
        const modalRef = this.modalService.open(AlertsComponent,{ size: 'sm', backdrop:'static' })
        modalRef.componentInstance.alertHeader = 'Error'
        modalRef.componentInstance.mensaje='No se pudo eliminar la tarifa intente de nuevo mas tarde'
        modalRef.result.then((result) => {
          this.closeResult = `Closed with: ${result}`;
          }, (reason) => {
              this.closeResult = `Dismissed ${this.getDismissReason(reason)}`;
          });
          setTimeout(() => {
            modalRef.close('Close click');
          },4000)
          return
      })
    
  }

  editarTarifaExpress(){

  }

  editTarifaEspecial(){
1
  }

  nuevaTarifaExpress(){
    const modalRef = this.modalService.open(TarifaExpressComponent, { size: 'md',backdrop: 'static' });

      modalRef.result.then( () =>
      this.tarifasService.fetch(),
      () => { }
      );
  }

  nuevaTarifaEspecial(){
    const modalRef = this.modalService.open(TarifaEspecialComponent, { size: 'md',backdrop: 'static' });

      modalRef.result.then( () =>
      this.tarifasService.fetch(),
      () => { }
      );
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
  // sorting
  // sort(column: string) {
  //   const sorting = this.sorting;
  //   const isActiveColumn = sorting.column === column;
  //   if (!isActiveColumn) {
  //     sorting.column = column;
  //     sorting.direction = 'desc';
  //   } else {
  //     sorting.direction = sorting.direction === 'desc' ? 'asc' : 'desc';
  //   }
  //   this.tarifasService.patchState({ sorting });
  // }

  // pagination
  // paginate(paginator: PaginatorState) {
  //   this.tarifasService.patchState({ paginator });
  // }


}
