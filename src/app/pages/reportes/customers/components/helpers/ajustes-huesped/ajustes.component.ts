import { Component, OnInit, ViewChild } from '@angular/core';
import { ModalDismissReasons, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { edoCuenta } from 'src/app/pages/reportes/_models/edoCuenta.model';
import { Edo_Cuenta_Service } from 'src/app/pages/reportes/_services/edo_cuenta.service';
import { EditReservaModalComponent } from '../../edit-reserva-modal/edit-reserva-modal.component';
import { AlertsComponent } from '../alerts-component/alerts/alerts.component';
import {MatTableDataSource} from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { Huesped } from 'src/app/pages/reportes/_models/customer.model';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-ajustes',
  templateUrl: './ajustes.component.html',
  styleUrls: ['./ajustes.component.scss']
})
export class AjustesComponent implements OnInit {
  displayedColumns: string[] = ['_id', 'Folio', 'Fecha', 'Referencia', 'Descripcion','Forma_De_Pago','Cantidad','Cargo','Abono'];

  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;

  edoCuenta$:Observable<edoCuenta[]>

  closeResult:string;
  alertHeader:string;
  mensaje:string
  totalCalculado:number=0
  /*MODELS*/
  estadoDeCuenta:edoCuenta[]=[];
  huesped:Huesped;
  /*Table*/
  dataSource: MatTableDataSource<edoCuenta>;
  // displayedColumns: string[] 


  constructor(
    
    private edoCuentaService:Edo_Cuenta_Service,
    private modalService : NgbModal
    ) { 

      this.edoCuenta$ = this.edoCuentaService.edoCuentaSubject.asObservable();
      this.edoCuenta$.subscribe(
        (result)=>
        {
          this.estadoDeCuenta=result
          this.dataSource = new MatTableDataSource(result);
        },
        (err)=>{
          if (err)
          {
            const modalRef = this.modalService.open(AlertsComponent,{size:'sm'})
            modalRef.componentInstance.mensaje='No se Pudo Cargar la Tabla'
            modalRef.componentInstance.alertHeader='Error'
            modalRef.result.then((result) => {
              this.closeResult = `Closed with: ${result}`;
              }, (reason) => {
                  this.closeResult = `Dismissed ${this.getDismissReason(reason)}`;
              });
              setTimeout(() => {
                modalRef.close('Close click');
              },4000)
          }
        }
        )


      console.log(this.displayedColumns)
      console.log(this.dataSource)
      
    }

  ngOnInit(): void {
  }

  ngAfterViewInit() {

    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }



 
  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();

    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }

  getDismissReason(reason: any): string 
    {
          if (reason === ModalDismissReasons.ESC) {
              return 'by pressing ESC';
          } else if (reason === ModalDismissReasons.BACKDROP_CLICK) {
              return 'by clicking on a backdrop';
          } else {
              return  `with: ${reason}`;
          }
    }

}
