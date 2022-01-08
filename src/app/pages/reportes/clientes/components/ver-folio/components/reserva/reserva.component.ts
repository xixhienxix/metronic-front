import { Component, OnInit } from '@angular/core';
import { NgbDatepickerI18n } from '@ng-bootstrap/ng-bootstrap';
import { Historico } from 'src/app/pages/reportes/_models/historico.model';
import { HistoricoService } from 'src/app/pages/reportes/_services/historico.service';

@Component({
  selector: 'app-reserva',
  templateUrl: './reserva.component.html',
  styleUrls: ['./reserva.component.scss']
})
export class ReservaComponent implements OnInit {

cliente:Historico

/*Date Variables*/
fullFechaSalida:string
fullFechaLlegada:string

  constructor(
    public historicoService : HistoricoService,
    public i18n: NgbDatepickerI18n,
  ) { 
    this.cliente = this.historicoService.getCurrentClienteValue
  }

  ngOnInit(): void {
    this.fullFechaLlegada = this.cliente.llegada.split('/')[0]+" de "+this.i18n.getMonthFullName(+this.cliente.llegada.split('/')[1])+" del "+this.cliente.llegada.split('/')[2] 
      this.fullFechaSalida=this.cliente.salida.split('/')[0]+" de "+this.i18n.getMonthFullName(+this.cliente.salida.split('/')[1])+" del "+this.cliente.salida.split('/')[2] 
  }

}
