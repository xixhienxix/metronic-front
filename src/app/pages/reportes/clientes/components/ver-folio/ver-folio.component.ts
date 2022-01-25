import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import { NgbActiveModal, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { Subscription } from 'rxjs';
import { NuevaReservaModalComponent } from '../../../customers/components/nueva-reserva-modal/nueva-reserva-modal.component';
import { Huesped } from '../../../_models/customer.model';
import { Historico } from '../../../_models/historico.model';
import { HistoricoService } from '../../../_services/historico.service';

@Component({
  selector: 'app-ver-folio',
  templateUrl: './ver-folio.component.html',
  styleUrls: ['./ver-folio.component.scss'],
  encapsulation: ViewEncapsulation.None,

})
export class VerFolioComponent implements OnInit {
  
  isLoading:boolean
  cliente:Historico
  huesped:Huesped
  /**DOM */
  selectedIndex:number
  selected:string='0'

  /**Subscription */
  subscription:Subscription[]=[]

  constructor(    
    public modalService: NgbModal,
    public modalActive: NgbActiveModal,
    public historicoService:HistoricoService,
    private router : Router
    ) {
   }

  ngOnInit(): void {
    this.historicoService.getCurrentClienteValue
  }

  nvareserva()
  {
    this.huesped=this.historicoService.getCurrentClienteValue
      const modalRef = this.modalService.open(NuevaReservaModalComponent, { size: 'md',backdrop: 'static' });
      modalRef.componentInstance.nombreHistorico = this.historicoService.getCurrentClienteValue.nombre
      modalRef.componentInstance.emailHistorico = this.historicoService.getCurrentClienteValue.email
      modalRef.componentInstance.telefonoHistorico = this.historicoService.getCurrentClienteValue.telefono
      modalRef.componentInstance.id_Socio = this.historicoService.getCurrentClienteValue.id_Socio

      modalRef.result.then( () =>
      () => { 
        this.modalActive.close();
        this.router.navigate(['reportes/customers'])
      }
      );
  }



  setStep(index:number){
    this.selectedIndex=index;
  }

 
}
