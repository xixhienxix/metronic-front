import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-alerts',
  templateUrl: './alerts.component.html',
  styleUrls: ['./alerts.component.scss']
})
export class AlertsComponent implements OnInit {
  mensaje:string;
  alertHeader:string;


  
  constructor(public modal: NgbActiveModal,
    ) { }

  ngOnInit(): void {

  }


}
