import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatTableDataSource } from '@angular/material/table';
import { NgbAccordion, NgbActiveModal, NgbDatepickerI18n, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { Subscription } from 'rxjs';
import { AlertsComponent } from 'src/app/main/alerts/alerts.component';
import { ParametrosServiceService } from 'src/app/pages/parametros/_services/parametros.service.service';
import { Historico } from 'src/app/pages/reportes/_models/historico.model';
import { HistoricoService } from 'src/app/pages/reportes/_services/historico.service';

@Component({
  selector: 'app-vista-cliente',
  templateUrl: './vista-cliente.component.html',
  styleUrls: ['./vista-cliente.component.scss']
})
export class VistaClienteComponent implements OnInit {

  /*RADIO BUTTONS*/
  checkedVIP:boolean=false;
  checkedRegular:boolean=false;
  checkedListaNegra:boolean=false;

  formGroup:FormGroup

  /**DOOM */
  isLoading:boolean=false;

  cliente:Historico
  tipoHuesped:string
  listaVisitasPrevias:Historico[]=[]
  cfdiList: string[] = ['Adquisición de mercancías', 'Devoluciones, descuentos o bonificaciones', 'Gastos en general', 
  'Construcciones', 'Mobiliario y equipo de oficina por inversiones', 'Equipo de transporte',
'Dados, troqueles, moldes, matrices y herramental','Comunicaciones telefónicas','Comunicaciones satelitales','Otra maquinaria y equipo',
'Honorarios médicos, dentales y gastos hospitalarios.','Gastos médicos por incapacidad o discapacidad','Gastos funerales.','Donativos',
'Intereses reales efectivamente pagados por créditos hipotecarios (casa habitación).','Aportaciones voluntarias al SAR.','Primas por seguros de gastos médicos.',
'Gastos de transportación escolar obligatoria.','Depósitos en cuentas para el ahorro, primas que tengan como base planes de pensiones.','Pagos por servicios educativos (colegiaturas)','Por definir'];

  subscription:Subscription[]=[]

    /*TABLE*/
    displayedColumns: string[] = ['folio','llegada','noches','tarifa'];
    dataSource: MatTableDataSource<any>;

  constructor(
    public historicoService : HistoricoService,
    public i18n: NgbDatepickerI18n,
    public fb : FormBuilder,
    public modalService : NgbModal,
    public activeModal : NgbActiveModal,
    public _parametrosService: ParametrosServiceService
  ) { 
    this.cliente = this.historicoService.getCurrentClienteValue
  }
  ngOnInit(): void {

//     HIZO CHECKOUT
// NO SE PRESENTÓ
// CANCELÓ

    if(this.historicoService.getCurrentClienteValue.tipoHuesped=="Regular"){this.checkedRegular=true}
    if(this.historicoService.getCurrentClienteValue.tipoHuesped=="VIP"){this.checkedVIP=true}
    if(this.historicoService.getCurrentClienteValue.tipoHuesped=="Lista Negra"){this.checkedListaNegra=true}
    this.getHistoricoVisitas()

    this.formGroup = this.fb.group({
      emailPrincipal : [this.historicoService.getCurrentClienteValue.email],
      telefonoPrincipal:[this.historicoService.getCurrentClienteValue.telefono],
      trabajaEn: [this.historicoService.getCurrentClienteValue.trabajaEn, Validators.compose([Validators.nullValidator,Validators.minLength(3),Validators.maxLength(100)])],
      fechaNacimiento: [this.historicoService.getCurrentClienteValue.fechaNacimiento, Validators.compose([Validators.nullValidator,Validators.minLength(3),Validators.maxLength(100)])],
      tipoDeID: [this.historicoService.getCurrentClienteValue.tipoDeID, Validators.compose([Validators.nullValidator,Validators.minLength(3),Validators.maxLength(100)])],
      numeroDeID: [this.historicoService.getCurrentClienteValue.numeroDeID, Validators.compose([Validators.nullValidator,Validators.minLength(3),Validators.maxLength(100)])],
      direccion: [this.historicoService.getCurrentClienteValue.direccion, Validators.compose([Validators.nullValidator,Validators.minLength(3),Validators.maxLength(100)])],
      pais: [this.historicoService.getCurrentClienteValue.pais, Validators.compose([Validators.nullValidator,Validators.minLength(3),Validators.maxLength(100)])],
      ciudad: [this.historicoService.getCurrentClienteValue.ciudad, Validators.compose([Validators.nullValidator,Validators.minLength(3),Validators.maxLength(100)])],
      codigoPostal: [this.historicoService.getCurrentClienteValue.codigoPostal, Validators.compose([Validators.nullValidator,Validators.minLength(3),Validators.maxLength(100)])],
      lenguaje: [this.historicoService.getCurrentClienteValue.lenguaje, Validators.compose([Validators.nullValidator,Validators.minLength(3),Validators.maxLength(100)])],
      razonsocial : [this.historicoService.getCurrentClienteValue.razonsocial],
      rfc:[this.historicoService.getCurrentClienteValue.rfc],
      cfdi:[this.historicoService.getCurrentClienteValue.cfdi],
      email:[this.historicoService.getCurrentClienteValue.email],
    });
  }



  getHistoricoVisitas(){
    const sb = this.historicoService.getVisitasById(this.historicoService.getCurrentClienteValue.id_Socio).subscribe(
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
  vipChecked(){
    this.tipoHuesped='VIP'
    this.checkedListaNegra=false;
    this.checkedRegular=false;
    this.checkedVIP=true
  }
  regularChecked(){
    this.tipoHuesped='Regular'
    this.checkedListaNegra=false;
    this.checkedRegular=true;
    this.checkedVIP=false
  }
  listaNegraChecked(){
    this.tipoHuesped='Lista Negra'
    this.checkedListaNegra=true;
    this.checkedRegular=false;
    this.checkedVIP=false
  }

  prepareHistorico() {

    if(this.checkedRegular){this.historicoService.getCurrentClienteValue.tipoHuesped="Regular"}
    if(this.checkedVIP){this.historicoService.getCurrentClienteValue.tipoHuesped="VIP"}
    if(this.checkedListaNegra){this.historicoService.getCurrentClienteValue.tipoHuesped="Lista Negra"}

    const formData = this.formGroup.value;
    
    let nuevoEmail
    if(formData.email === undefined || formData.email=='' && formData.email){nuevoEmail=formData.emailPrincipal}
    if(formData.emailPrincipal === undefined || formData.emailPrincipal==''){nuevoEmail=formData.email}
    if(formData.email == this.historicoService.getCurrentClienteValue.email){nuevoEmail=formData.emailPrincipal}
    if(formData.emailPrincipal == this.historicoService.getCurrentClienteValue.email) {nuevoEmail=formData.email}
    const detailsList:Historico = {
      id_Socio:this.historicoService.getCurrentClienteValue.id_Socio,
      folio:this.historicoService.getCurrentClienteValue.folio,
      adultos:this.historicoService.getCurrentClienteValue.adultos,
      ninos:this.historicoService.getCurrentClienteValue.ninos,
      nombre:formData.nombre,
      numeroCuarto:this.historicoService.getCurrentClienteValue.numeroCuarto,
      estatus_historico:this.historicoService.getCurrentClienteValue.estatus_historico,
      estatus:this.historicoService.getCurrentClienteValue.estatus,
      llegada:this.historicoService.getCurrentClienteValue.llegada,
      salida:this.historicoService.getCurrentClienteValue.salida,
      noches:this.historicoService.getCurrentClienteValue.noches,
      tarifa:this.historicoService.getCurrentClienteValue.tarifa,
      porPagar:this.historicoService.getCurrentClienteValue.porPagar,
      pendiente:this.historicoService.getCurrentClienteValue.pendiente,
      origen:this.historicoService.getCurrentClienteValue.origen,
      habitacion:this.historicoService.getCurrentClienteValue.habitacion,
      telefono:formData.telefonoPrincipal,

      email:nuevoEmail,
      
      motivo:this.historicoService.getCurrentClienteValue.motivo,
      creada:this.historicoService.getCurrentClienteValue.creada,

      tipoHuesped:this.tipoHuesped,
      fechaNacimiento:formData.fechaNacimiento,
      trabajaEn:formData.trabajaEn,
      tipoDeID:formData.tipoDeID,
      numeroDeID:formData.numeroDeID,
      direccion:formData.direccion,
      pais:formData.pais,
      ciudad:formData.ciudad,
      codigoPostal:formData.codigoPostal,
      lenguaje:formData.lenguaje,

      razonsocial:formData.razonsocial,
      rfc:formData.rfc,
      cfdi:formData.cfdi
    }


    this.isLoading=true;
    const sb = this.historicoService.updateHistorico(detailsList).subscribe(
      (value)=>{
        this.historicoService.fetch(sessionStorage.getItem("HOTEL"));
        this.isLoading=false
            const modalRef = this.modalService.open(AlertsComponent,{ size: 'sm', backdrop:'static' })
              modalRef.componentInstance.alertHeader='Exito'
              modalRef.componentInstance.mensaje = 'Datos del Cliente Actualizados con exito!'
              setTimeout(() => {
                modalRef.close('Close click');
              },4000)
     
          this.subscription.push(sb)
          this.activeModal.close();
      },
      (error)=>{
        if(error)
        {
          this.isLoading=false

          const modalRef = this.modalService.open(AlertsComponent,{ size: 'sm', backdrop:'static' })
          modalRef.componentInstance.alertHeader='Error'
          modalRef.componentInstance.mensaje = 'No se pudieron actualizar los datos del Cliente'
          setTimeout(() => {
            modalRef.close('Close click');
          },4000)
        }
      }
      );
      this.subscription.push(sb)


  }

  formReset(){
    this.formGroup.reset()
  }
}
