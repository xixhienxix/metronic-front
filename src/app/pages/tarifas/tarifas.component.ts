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


  constructor(
  
  ) { 
    
  }

  ngOnInit(): void {


  }




}
