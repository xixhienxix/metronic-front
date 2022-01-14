import { Component, OnInit } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { NgbDatepickerI18n } from '@ng-bootstrap/ng-bootstrap';
import { Historico } from 'src/app/pages/reportes/_models/historico.model';
import { HistoricoService } from 'src/app/pages/reportes/_services/historico.service';

@Component({
  selector: 'app-vista-cliente',
  templateUrl: './vista-cliente.component.html',
  styleUrls: ['./vista-cliente.component.scss']
})
export class VistaClienteComponent implements OnInit {

  cliente:Historico
  listaVisitasPrevias:Historico[]=[]

    /*TABLE*/
    displayedColumns: string[] = ['folio','creada','noches','tarifa'];
    dataSource: MatTableDataSource<Historico>;

  constructor(
    public historicoService : HistoricoService,
    public i18n: NgbDatepickerI18n,
  ) { 
    this.cliente = this.historicoService.getCurrentClienteValue
  }
  ngOnInit(): void {
    this.getHistoricoVisitas()
  }

  getHistoricoVisitas(){
    const sb = this.historicoService.getHistoricoVisitas(this.historicoService.getCurrentClienteValue.id_Socio).subscribe(
      (lista)=>{
        if(lista){
          for(let i=0;i<lista.length;i++){
            this.listaVisitasPrevias.push(lista[i])
          }
          
          this.dataSource = new MatTableDataSource(this.listaVisitasPrevias);   

        }

      },
      (error)=>{

      })
  }

}
