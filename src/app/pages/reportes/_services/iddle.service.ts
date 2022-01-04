import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { DEFAULT_INTERRUPTSOURCES, Idle } from '@ng-idle/core';
import { Keepalive } from '@ng-idle/keepalive';
import { AlertsComponent } from '../../../main/alerts/alerts.component';

@Injectable({
  providedIn: 'root'
})
export class IddleService {
  
  idleState = 'Not started.';
  timedOut = false;
  lastPing?: Date = null;
  title = 'angular-idle-timeout';
  isProgress:boolean
  countdown:number;

  constructor(
    private idle: Idle, 
    private modal:NgbModal,
    private keepalive: Keepalive,
    private router: Router,

  ) {

   }

   initiateIddle(){
     //Idle
     // sets an idle timeout of 5 seconds, for testing purposes.
     this.idle.setIdle(2500);
     // sets a timeout period of 5 seconds. after 10 seconds of inactivity, the user will be considered timed out.
     this.idle.setTimeout(5);
     // sets the default interrupts, in this case, things like clicks, scrolls, touches to the document
     this.idle.setInterrupts(DEFAULT_INTERRUPTSOURCES);
 
     this.idle.onIdleEnd.subscribe(() => { 
       this.idleState = 'No longer idle.'
       this.reset();
     });
     
     this.idle.onTimeout.subscribe(() => {
       this.idleState = 'Timed out!';
       this.timedOut = true;
       this.router.navigate(['/']);
       localStorage.removeItem('ACCESS_TOKEN')
       localStorage.removeItem('USER')
    });
     
     this.idle.onIdleStart.subscribe(() => {
         this.idleState = 'Su sesión esta inactiva'
         const modalRef = this.modal.open(AlertsComponent,{ size: 'sm', backdrop:'static' })
         modalRef.componentInstance.alertHeader='Advertencia'
         modalRef.componentInstance.mensaje='Su sesion esta inactiva, la session se cerrara en 5 segundos'
         modalRef.componentInstance.isProgress=true
         modalRef.componentInstance.interval=5
         
     });
     
     this.idle.onTimeoutWarning.subscribe((countdown) => {
       this.countdown=countdown
       this.idleState = 'Su session se cerrara en: ' + this.countdown + ' segundos!'
     });
 
     // sets the ping interval to 15 seconds
     this.keepalive.interval(15);
 
     this.keepalive.onPing.subscribe(() => this.lastPing = new Date());
 
     this.reset();
   }

   reset() {
    this.idle.watch();
    this.idleState = 'Started.';
    this.timedOut = false;
  }


  
   
}
