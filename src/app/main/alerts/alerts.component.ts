import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { ThemePalette } from '@angular/material/core';
import { ProgressBarMode } from '@angular/material/progress-bar';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { interval, Subscription } from 'rxjs';
import { take } from 'rxjs/operators';

@Component({
  selector: 'app-alerts',
  templateUrl: './alerts.component.html',
  styleUrls: ['./alerts.component.scss']
})
export class AlertsComponent implements OnInit {
  mensaje:string;
  alertHeader:string;
  interval:number
  countdown:number=0
  isProgress:boolean
  subscription:Subscription[]=[]
  
  constructor(public modal: NgbActiveModal,
    ) { }

  ngOnInit(): void {

    var timer =  interval(1000).pipe(
      take(this.interval)
      );
      const sb = timer.subscribe(x => 
        {
          this.countdown=this.interval-x
          console.log(this.interval-x)
          if(this.countdown==1){this.modal.close()}
        })

this.subscription.push(sb)
  }
  ngOnDestroy():void
  {
    this.subscription.forEach(sb=>sb.unsubscribe())
  }

}