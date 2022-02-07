import { Location } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ModalDismissReasons, NgbActiveModal, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { AlertsComponent } from 'src/app/main/alerts/alerts.component';
import { AuditoriaService } from 'src/app/main/_services/auditoria.service';
import { LayoutService } from '../../../../_metronic/core';

@Component({
  selector: 'app-aside',
  templateUrl: './aside.component.html',
  styleUrls: ['./aside.component.scss'],
})
export class AsideComponent implements OnInit {
  disableAsideSelfDisplay: boolean;
  headerLogo: string;
  brandSkin: string;
  ulCSSClasses: string;
  location: Location;
  asideMenuHTMLAttributes: any = {};
  asideMenuCSSClasses: string;
  asideMenuDropdown;
  brandClasses: string;
  asideMenuScroll = 1;
  asideSelfMinimizeToggle = false;
  closeResult: string;


  constructor(private layout: LayoutService, private loc: Location, public modal:NgbModal, public auditoriaService:AuditoriaService ){ }

  ngOnInit(): void {
    // load view settings
    this.disableAsideSelfDisplay =
      this.layout.getProp('aside.self.display') === false;
    this.brandSkin = this.layout.getProp('brand.self.theme');
    this.headerLogo = this.getLogo();
    this.ulCSSClasses = this.layout.getProp('aside_menu_nav');
    this.asideMenuCSSClasses = this.layout.getStringCSSClasses('aside_menu');
    this.asideMenuHTMLAttributes = this.layout.getHTMLAttributes('aside_menu');
    this.asideMenuDropdown = this.layout.getProp('aside.menu.dropdown') ? '1' : '0';
    this.brandClasses = this.layout.getProp('brand');
    this.asideSelfMinimizeToggle = this.layout.getProp(
      'aside.self.minimize.toggle'
    );
    this.asideMenuScroll = this.layout.getProp('aside.menu.scroll') ? 1 : 0;
    // this.asideMenuCSSClasses = `${this.asideMenuCSSClasses} ${this.asideMenuScroll === 1 ? 'scroll my-4 ps ps--active-y' : ''}`;
    // Routing
    this.location = this.loc;
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
private getDismissReason(reason: any): string {
  if (reason === ModalDismissReasons.ESC) {
      return 'by pressing ESC';
  } else if (reason === ModalDismissReasons.BACKDROP_CLICK) {
      return 'by clicking on a backdrop';
  } else {
      return  `with: ${reason}`;
  }
}
  private getLogo() {
    if (this.brandSkin === 'light') {
      return './assets/media/logos/logo-dark.png';
    } else {
      return './assets/media/logos/logo-light.png';
    }
  }
}
