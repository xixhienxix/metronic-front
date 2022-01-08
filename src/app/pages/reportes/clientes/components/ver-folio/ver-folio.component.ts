import { Component, OnInit } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { NgbActiveModal, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { Historico } from '../../../_models/historico.model';
import { HistoricoService } from '../../../_services/historico.service';

@Component({
  selector: 'app-ver-folio',
  templateUrl: './ver-folio.component.html',
  styleUrls: ['./ver-folio.component.scss']
})
export class VerFolioComponent implements OnInit {
  
  isLoading:boolean
  cliente:Historico
  /**DOM */
  selectedIndex:number
  selected:string='0'

  constructor(    
    public modal: NgbActiveModal,
    public historicoService:HistoricoService
    ) {
      console.log(this.historicoService.getCurrentClienteValue)
   }

  ngOnInit(): void {
    // this.selected=this.historicoService.getCurrentClienteValue.estatus
    this.historicoService.getCurrentClienteValue
  }

  setStep(index:number){
    this.selectedIndex=index;
  }

 
}
