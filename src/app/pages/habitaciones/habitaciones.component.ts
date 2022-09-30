import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import { ModalDismissReasons, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { Subscription } from 'rxjs';
import { AlertsComponent } from 'src/app/main/alerts/alerts.component';
import { GroupingState, PaginatorState, SortState } from 'src/app/_metronic/shared/crud-table';
import { Habitacion } from './_models/habitacion';
import { HabitacionesService } from './_services/habitaciones.service';

@Component({
  selector: 'app-habitaciones',
  templateUrl: './habitaciones.component.html',
  styleUrls: ['./habitaciones.component.scss']
})
export class HabitacionesComponent implements OnInit {

  constructor( 
   
  ) { 
  }

  ngOnInit(): void {

  }
}
