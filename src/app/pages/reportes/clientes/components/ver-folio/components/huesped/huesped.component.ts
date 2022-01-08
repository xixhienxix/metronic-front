import { Component, OnInit } from '@angular/core';
import { NgbDatepickerI18n } from '@ng-bootstrap/ng-bootstrap';
import { Historico } from 'src/app/pages/reportes/_models/historico.model';
import { HistoricoService } from 'src/app/pages/reportes/_services/historico.service';

@Component({
  selector: 'app-huesped',
  templateUrl: './huesped.component.html',
  styleUrls: ['./huesped.component.scss']
})
export class HuespedComponent implements OnInit {

cliente:Historico
cfdiList: string[] = ['Adquisición de mercancías', 'Devoluciones, descuentos o bonificaciones', 'Gastos en general', 
'Construcciones', 'Mobiliario y equipo de oficina por inversiones', 'Equipo de transporte',
'Dados, troqueles, moldes, matrices y herramental','Comunicaciones telefónicas','Comunicaciones satelitales','Otra maquinaria y equipo',
'Honorarios médicos, dentales y gastos hospitalarios.','Gastos médicos por incapacidad o discapacidad','Gastos funerales.','Donativos',
'Intereses reales efectivamente pagados por créditos hipotecarios (casa habitación).','Aportaciones voluntarias al SAR.','Primas por seguros de gastos médicos.',
'Gastos de transportación escolar obligatoria.','Depósitos en cuentas para el ahorro, primas que tengan como base planes de pensiones.','Pagos por servicios educativos (colegiaturas)','Por definir'];

  constructor(
    public historicoService : HistoricoService,
    public i18n: NgbDatepickerI18n,
  ) { 
    this.cliente = this.historicoService.getCurrentClienteValue
  }
  ngOnInit(): void {
  }

}
