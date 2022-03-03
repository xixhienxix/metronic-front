import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import { ModalDismissReasons, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { Subscription } from 'rxjs';
import { AlertsComponent } from 'src/app/main/alerts/alerts.component';
import { GroupingState, PaginatorState, SortState } from 'src/app/_metronic/shared/crud-table';
import { Habitacion } from '../../_models/habitacion';
import { HabitacionesService } from '../../_services/habitaciones.service';

@Component({
  selector: 'app-habitacion-main',
  templateUrl: './habitacion-main.component.html',
  styleUrls: ['./habitacion-main.component.scss']
})
export class HabitacionMainComponent implements OnInit {
  //DOM
  isLoading: boolean;

  //Forms
  filterGroup: FormGroup;
  searchGroup: FormGroup;

  //Filtros
  paginator: PaginatorState;
  sorting: SortState;
  grouping: GroupingState;

  //Modal
  closeResult: string;

  //Models
  habitacionesArr:Habitacion[]=[]
  // inventario:Habitacion = {
  //   Codigo: '',
  //   Numero: 0,
  //   Descripcion: '',
  //   Estatus: 0,
  //   Camas: 0,
  //   Personas: 0,
  //   Personas_Extra: 0,
  //   Tarifa: 0
  // }
  
  private subscriptions: Subscription[] = [];
  
  constructor(
    public fb : FormBuilder,
    public habitacionService:HabitacionesService,
    public modalService :NgbModal,
    private router:Router
  ) {  
    this.habitacionService.fetch(); 
  }

  ngOnInit(): void {

    const sb = this.habitacionService.items$.subscribe(
      (value)=>{
     
      if(value.length===0){
        const modalRef=this.modalService.open(AlertsComponent,{ size: 'sm', backdrop:'static' })
        modalRef.componentInstance.alertsHeader='Advertencia'
        modalRef.componentInstance.mensaje='No tiene Habitaciones dadas de Alta, debe crear una habitacion para comenzar con la applicacion'

        modalRef.result.then((result) => {
          if(result=='Aceptar')        
          {
            this.router.navigate(['/habitacion/alta'])
          } 
          this.closeResult = `Closed with: ${result}`;
          }, (reason) => {
              this.closeResult = `Dismissed ${this.getDismissReason(reason)}`;
          });
      }
        else {
          this.habitacionesArr=value
        }

        // for(let {Codigo, Descripcion, Personas } of value)
        
        //   this.inventario[Codigo] = { 
        //     Codigo, 
        //     Descripcion,
        //     Personas, 
        //     Inventario: this.inventario[Codigo] ? this.inventario[Codigo].count + 1 : 1
        //   }

      },
      (error)=>{

      });

      this.subscriptions.push(sb);

    this.grouping = this.habitacionService.grouping;
    this.paginator = this.habitacionService.paginator;
    this.sorting = this.habitacionService.sorting;
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
