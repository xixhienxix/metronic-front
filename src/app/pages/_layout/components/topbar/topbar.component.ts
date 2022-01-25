import { Component, OnInit, AfterViewInit } from '@angular/core';
import { Observable, Subscription } from 'rxjs';
import { LayoutService } from '../../../../_metronic/core';
import { AuthService } from '../../../../modules/auth/_services/auth.service';
import { UserModel } from '../../../../modules/auth/_models/user.model';
import KTLayoutQuickSearch from '../../../../../assets/js/layout/extended/quick-search';
import KTLayoutQuickNotifications from '../../../../../assets/js/layout/extended/quick-notifications';
import KTLayoutQuickActions from '../../../../../assets/js/layout/extended/quick-actions';
import KTLayoutQuickCartPanel from '../../../../../assets/js/layout/extended/quick-cart';
import KTLayoutQuickPanel from '../../../../../assets/js/layout/extended/quick-panel';
import KTLayoutQuickUser from '../../../../../assets/js/layout/extended/quick-user';
import KTLayoutHeaderTopbar from '../../../../../assets/js/layout/base/header-topbar';
import { KTUtil } from '../../../../../assets/js/components/util';
import { AuthModel } from 'src/app/modules/auth/_services/auth.service';
import { ParametrosServiceService } from 'src/app/pages/parametros/_services/parametros.service.service';
import {DateTime} from 'luxon'
import { AuditoriaService } from 'src/app/main/_services/auditoria.service';
import { ModalDismissReasons, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { AlertsComponent } from 'src/app/main/alerts/alerts.component';

@Component({
  selector: 'app-topbar',
  templateUrl: './topbar.component.html',
  styleUrls: ['./topbar.component.scss'],
})
export class TopbarComponent implements OnInit, AfterViewInit {
  user$: Observable<AuthModel>;
  fecha:Date
  /*Temp Variables*/
  fecha0:string;
  fecha1:string;
  subscription:Subscription[]=[]
  luxon:string
  // tobbar extras
  extraSearchDisplay: boolean;
  extrasSearchLayout: 'offcanvas' | 'dropdown';
  extrasNotificationsDisplay: boolean;
  extrasNotificationsLayout: 'offcanvas' | 'dropdown';
  extrasQuickActionsDisplay: boolean;
  extrasQuickActionsLayout: 'offcanvas' | 'dropdown';
  extrasCartDisplay: boolean;
  extrasCartLayout: 'offcanvas' | 'dropdown';
  extrasQuickPanelDisplay: boolean;
  extrasLanguagesDisplay: boolean;
  extrasUserDisplay: boolean;
  extrasUserLayout: 'offcanvas' | 'dropdown';
  closeResult: string;

  constructor(
    private layout: LayoutService,
    private auth: AuthService,
    public parametrosService:ParametrosServiceService,
    public auditoriaService:AuditoriaService,
    public modal : NgbModal
      ) {
    this.user$ = this.auth.currentUserSubject.asObservable();
    const sb = this.parametrosService.getParametros().subscribe(
      (value)=>{
        this.fecha = new Date();
       this.fecha = DateTime.now().setZone(parametrosService.getCurrentParametrosValue.zona)
       this.fecha0=this.fecha.toString().split('T')[0]        
       this.fecha1=this.fecha.toString().split('T')[1]      
      });
    this.subscription.push(sb)
  }

  ngOnInit(): void {
    // topbar extras
    this.extraSearchDisplay = this.layout.getProp('extras.search.display');
    this.extrasSearchLayout = this.layout.getProp('extras.search.layout');
    this.extrasNotificationsDisplay = this.layout.getProp(
      'extras.notifications.display'
    );
    this.extrasNotificationsLayout = this.layout.getProp(
      'extras.notifications.layout'
    );
    this.extrasQuickActionsDisplay = this.layout.getProp(
      'extras.quickActions.display'
    );
    this.extrasQuickActionsLayout = this.layout.getProp(
      'extras.quickActions.layout'
    );
    this.extrasCartDisplay = this.layout.getProp('extras.cart.display');
    this.extrasCartLayout = this.layout.getProp('extras.cart.layout');
    this.extrasLanguagesDisplay = this.layout.getProp(
      'extras.languages.display'
    );
    this.extrasUserDisplay = this.layout.getProp('extras.user.display');
    this.extrasUserLayout = this.layout.getProp('extras.user.layout');
    this.extrasQuickPanelDisplay = this.layout.getProp(
      'extras.quickPanel.display'
    );
    this.user$ = this.auth.currentUserSubject.asObservable();

  }

  auditoria(){
        const mensaje='El proceso de Auditoria realiza las siguientes revisiones a los Húespedes y Reservaciones vigentes '
        const mensaje1='- Cambiara todas las reservaciones que llegan al dia a estatus No-Show siempre y cuando pase de la hora de NoShow determinada en la seccion de Parametros'
        const mensaje2='- Camibiara a Check-Out todos los húespedes cuyas cuentas esten en 0s y tengan fecha de salida del dia de hoy siempre y cuando pase de la hora de NoShow determinada en la seccion de Parametros'
        const mensaje3='Desea continuar???'
    const modalRef = this.modal.open(AlertsComponent,{size:'sm'})
    modalRef.componentInstance.alertHeader = 'Precaucion'
    modalRef.componentInstance.mensaje=mensaje
    modalRef.componentInstance.mensaje1=mensaje1
    modalRef.componentInstance.mensaje2=mensaje2
    modalRef.componentInstance.mensaje3=mensaje3
    modalRef.componentInstance.mensajeExtra=true
    
      modalRef.result.then((result) => {
        if(result=='Aceptar')        
        {
          this.auditoriaService.procesaAuditoria();
        } 
        this.closeResult = `Closed with: ${result}`;
        }, (reason) => {
            this.closeResult = `Dismissed ${this.getDismissReason(reason)}`;
        });

  }

  ngAfterViewInit(): void {
    KTUtil.ready(() => {
      // Called after ngAfterContentInit when the component's view has been initialized. Applies to components only.
      // Add 'implements AfterViewInit' to the class.
      if (this.extraSearchDisplay && this.extrasSearchLayout === 'offcanvas') {
        KTLayoutQuickSearch.init('kt_quick_search');
      }

      if (
        this.extrasNotificationsDisplay &&
        this.extrasNotificationsLayout === 'offcanvas'
      ) {
        // Init Quick Notifications Offcanvas Panel
        KTLayoutQuickNotifications.init('kt_quick_notifications');
      }

      if (
        this.extrasQuickActionsDisplay &&
        this.extrasQuickActionsLayout === 'offcanvas'
      ) {
        // Init Quick Actions Offcanvas Panel
        KTLayoutQuickActions.init('kt_quick_actions');
      }

      if (this.extrasCartDisplay && this.extrasCartLayout === 'offcanvas') {
        // Init Quick Cart Panel
        KTLayoutQuickCartPanel.init('kt_quick_cart');
      }

      if (this.extrasQuickPanelDisplay) {
        // Init Quick Offcanvas Panel
        KTLayoutQuickPanel.init('kt_quick_panel');
      }

      if (this.extrasUserDisplay && this.extrasUserLayout === 'offcanvas') {
        // Init Quick User Panel
        KTLayoutQuickUser.init('kt_quick_user');
      }

      // Init Header Topbar For Mobile Mode
      KTLayoutHeaderTopbar.init('kt_header_mobile_topbar_toggle');
    });
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

  ngOnDestroy():void
  {
    this.subscription.forEach(sb=>sb.unsubscribe())
  }
}
