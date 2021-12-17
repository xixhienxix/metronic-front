import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NgbActiveModal, NgbCalendar, NgbDate, NgbDateParserFormatter, NgbDatepickerI18n, NgbDateStruct, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { of, Subscription } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { Huesped } from 'src/app/pages/reportes/_models/customer.model';
import { Huesped_Detail } from 'src/app/pages/reportes/_models/huesped.details.model';
import { HuespedService } from 'src/app/pages/reportes/_services';
import { Huesped_Detail_Service } from 'src/app/pages/reportes/_services/huesped.detail.service';
import { AlertsComponent } from '../../../../../../../../main/alerts/alerts.component';
import {DateTime} from 'luxon'
import { ParametrosServiceService } from 'src/app/pages/parametros/_services/parametros.service.service';

const EMPTY_DETAILS ={
  ID_Socio:null,
  Nombre:'',
  email:'',
  telefono:'',
  tipoHuesped:'',
  fechaNacimiento:'',
  trabajaEn:'',
  tipoDeID:'',
  numeroDeID:'',
  direccion:'',
  pais:'',
  ciudad:'',
  codigoPostal:'',
  lenguaje:'',
  notas:''
}

@Component({
  selector: 'app-huesped-component',
  templateUrl: './huesped-component.component.html',
  styleUrls: ['./huesped-component.component.scss']
})
export class HuespedComponentComponent implements OnInit {
  
  /*RADIO BUTTONS*/
  checkedVIP:boolean=false;
  checkedRegular:boolean=false;
  checkedListaNegra:boolean=false;

  /**DATES */
  fromDate: DateTime | null;
  toDate: DateTime | null;
  fechaFinalBloqueo:string
  model: NgbDateStruct;
  today:DateTime|null;
  todayString:string;
  
  formGroup: FormGroup;
  facturacionFormGroup: FormGroup;

  /*Models*/
  huesped:Huesped
  details:Huesped_Detail
  detailsList:Huesped_Detail=EMPTY_DETAILS
  id_Socio:number;
  cfdiList: string[] = ['Adquisición de mercancías', 'Devoluciones, descuentos o bonificaciones', 'Gastos en general', 
  'Construcciones', 'Mobiliario y equipo de oficina por inversiones', 'Equipo de transporte',
'Dados, troqueles, moldes, matrices y herramental','Comunicaciones telefónicas','Comunicaciones satelitales','Otra maquinaria y equipo',
'Honorarios médicos, dentales y gastos hospitalarios.','Gastos médicos por incapacidad o discapacidad','Gastos funerales.','Donativos',
'Intereses reales efectivamente pagados por créditos hipotecarios (casa habitación).','Aportaciones voluntarias al SAR.','Primas por seguros de gastos médicos.',
'Gastos de transportación escolar obligatoria.','Depósitos en cuentas para el ahorro, primas que tengan como base planes de pensiones.','Pagos por servicios educativos (colegiaturas)','Por definir'];

  /*Diseño Dinamico*/
  modifica:boolean = true;
  isLoading:boolean=false;
  
  private subscriptions: Subscription[] = [];

  constructor(
    public formatter: NgbDateParserFormatter,
    private customerService:HuespedService,
    private calendar : NgbCalendar,
    private i18n:NgbDatepickerI18n,
    public modal: NgbActiveModal,
    public fb : FormBuilder,
    public modalService : NgbModal,
    private detallesService : Huesped_Detail_Service,
    public parametrosService : ParametrosServiceService
  ) 
  {  
    this.today = DateTime.now().setZone(this.parametrosService.getCurrentParametrosValue.zona)

    this.fromDate = DateTime.now().setZone({ zone: this.parametrosService.getCurrentParametrosValue.zona}) 
    this.toDate = DateTime.now().setZone({ zone: this.parametrosService.getCurrentParametrosValue.zona}) .plus({ days: 1 }) 
    console.log(this.fromDate)
    console.log(this.toDate)
    this.fechaFinalBloqueo=this.toDate.day+" de "+this.i18n.getMonthFullName(this.toDate.month)+" del "+this.toDate.year 
  }

  ngOnInit(): void {
    this.customerService.huespedUpdate$.subscribe((value)=>{
      this.huesped=value
      

      this.detallesService.getDetailsById(this.huesped.ID_Socio).subscribe(
        (response)=>{
          this.detailsList=response
          if(response){
            this.id_Socio=this.detailsList.ID_Socio

            this.formGroup.controls['trabajaEn'].setValue(this.detailsList.trabajaEn)
            this.formGroup.controls['fechaNacimiento'].setValue(this.detailsList.fechaNacimiento)
            this.formGroup.controls['tipoDeID'].setValue(this.detailsList.tipoDeID)
            this.formGroup.controls['numeroDeID'].setValue(this.detailsList.numeroDeID)
            this.formGroup.controls['direccion'].setValue(this.detailsList.direccion)
            this.formGroup.controls['pais'].setValue(this.detailsList.pais)
            this.formGroup.controls['ciudad'].setValue(this.detailsList.ciudad)
            this.formGroup.controls['codigoPostal'].setValue(this.detailsList.codigoPostal)
            this.formGroup.controls['lenguaje'].setValue(this.detailsList.lenguaje)
            this.formGroup.controls['notas'].setValue(this.detailsList.notas)
          }
          else {
            this.detailsList=EMPTY_DETAILS
            this.id_Socio=this.detailsList.ID_Socio
          }
          

        },
        (error)=>{
          this.detailsList=EMPTY_DETAILS
        }
        )
    })

    this.loadForm();

  }

  loadForm() {

    if(this.huesped.tipoHuesped=="Regular"){this.checkedRegular=true}
    if(this.huesped.tipoHuesped=="VIP"){this.checkedVIP=true}
    if(this.huesped.tipoHuesped=="Lista Negra"){this.checkedListaNegra=true}


    this.formGroup = this.fb.group({
      nombre: [this.huesped.nombre, Validators.compose([Validators.required, Validators.minLength(3), Validators.maxLength(100)])],
      email: [this.huesped.email, Validators.compose([Validators.email,Validators.pattern("^[a-z0-9._%+-]+@[a-z0-9.-]+\\.[a-z]{2,4}$"),Validators.minLength(3),Validators.maxLength(50)])],
      telefono: [this.huesped.telefono, Validators.compose([Validators.nullValidator,Validators.minLength(10),Validators.maxLength(14)])],
      trabajaEn: ['', Validators.compose([Validators.nullValidator,Validators.minLength(3),Validators.maxLength(100)])],
      fechaNacimiento: ['', Validators.compose([Validators.nullValidator,Validators.minLength(3),Validators.maxLength(100)])],
      tipoDeID: ['', Validators.compose([Validators.nullValidator,Validators.minLength(3),Validators.maxLength(100)])],
      numeroDeID: ['', Validators.compose([Validators.nullValidator,Validators.minLength(3),Validators.maxLength(100)])],
      direccion: ['', Validators.compose([Validators.nullValidator,Validators.minLength(3),Validators.maxLength(100)])],
      pais: ['', Validators.compose([Validators.nullValidator,Validators.minLength(3),Validators.maxLength(100)])],
      ciudad: ['', Validators.compose([Validators.nullValidator,Validators.minLength(3),Validators.maxLength(100)])],
      codigoPostal: ['', Validators.compose([Validators.nullValidator,Validators.minLength(3),Validators.maxLength(100)])],
      lenguaje: ['', Validators.compose([Validators.nullValidator,Validators.minLength(3),Validators.maxLength(100)])],
      notas:[''],
    });

    this.facturacionFormGroup= this.fb.group({
      razonsocial : ['',Validators.required],
      rfc:['',Validators.required],
      cfdi:['',Validators.required],
      email:['',Validators.required]
    })
  }

  get f() {
    return this.formGroup.controls
  }

  formatDate(fecha:any){
  this.todayString= fecha.day+" de "+this.i18n.getMonthFullName(fecha.month)+" del "+fecha.year
  }

  save() {
    this.getNumeroSocio();
    this.prepareHuesped();
    this.create();
  }

  vipChecked(){
    this.checkedListaNegra=false;
    this.checkedRegular=false;
    this.checkedVIP=true
  }
  regularChecked(){
    this.checkedListaNegra=false;
    this.checkedRegular=true;
    this.checkedVIP=false
  }
  listaNegraChecked(){
    this.checkedListaNegra=true;
    this.checkedRegular=false;
    this.checkedVIP=false
  }

  private prepareHuesped() {

    if(this.checkedRegular){this.huesped.tipoHuesped="Regular"}
    if(this.checkedVIP){this.huesped.tipoHuesped="VIP"}
    if(this.checkedListaNegra){this.huesped.tipoHuesped="Lista Negra"}
    const formData = this.formGroup.value;
    this.huesped.nombre = formData.nombre
    this.huesped.email = formData.email
    this.huesped.telefono = formData.telefono
    this.huesped.id=this.huesped.folio
    this.huesped.notas=formData.notas
    this.huesped.ID_Socio=this.id_Socio

    this.detailsList = {
      ID_Socio:this.id_Socio,
      Nombre:formData.nombre,
      email:formData.email,
      telefono:formData.telefono,
      tipoHuesped:formData.tipoHuesped,
      fechaNacimiento:formData.fechaNacimiento,
      trabajaEn:formData.trabajaEn,
      tipoDeID:formData.tipoDeID,
      numeroDeID:formData.numeroDeID,
      direccion:formData.direccion,
      pais:formData.pais,
      ciudad:formData.ciudad,
      codigoPostal:formData.codigoPostal,
      lenguaje:formData.lenguaje,
      notas:formData.notas

    }
    this.isLoading=true;
    this.customerService.updateHuesped(this.huesped).subscribe(
      (value)=>{

        this.detallesService.updateDetails(this.detailsList).subscribe(
          (response)=>{
            this.isLoading=false
            const modalRef = this.modalService.open(AlertsComponent,{ size: 'sm', backdrop:'static' })
              modalRef.componentInstance.alertHeader='Exito'
              modalRef.componentInstance.mensaje = 'Datos del Huesped Actualizados con exito'
          },
          (error)=>{
            if(error)
            {
              this.isLoading=false

              const modalRef = this.modalService.open(AlertsComponent,{ size: 'sm', backdrop:'static' })
              modalRef.componentInstance.alertHeader='Error'
              modalRef.componentInstance.mensaje = 'No se pudieron actualizar los datos del detalle del huesped'
            }
          })
      },
      (error)=>{
        if(error)
        {
          this.isLoading=false

          const modalRef = this.modalService.open(AlertsComponent,{ size: 'sm', backdrop:'static' })
          modalRef.componentInstance.alertHeader='Error'
          modalRef.componentInstance.mensaje = 'No se pudieron actualizar los datos del Huesped'
        }
      }
      );


  }
  formReset(){
    this.formGroup.reset()
  }
  
  getNumeroSocio(){
    this.detallesService.getDetails().subscribe(
      (value)=>{
        if(value){
          this.id_Socio = value.ID_Socio + 1
        }else{
          this.id_Socio = 1
        }
        this.details=value

      },
      (err)=>{
        if(err){
          const modalRef = this.modalService.open(AlertsComponent,{ size: 'sm', backdrop:'static' })
          modalRef.componentInstance.alertHeader='Error'
          modalRef.componentInstance.mensaje ='No se pudieron recuperar los datos del numero de Socio'
        }
      })
  }

  // idSocio(){
  //   if(!this.details){
  //     this.id_Socio = 1
  //   }else {
  //     this.id_Socio = this.details.ID_Socio + 1
  //   }
  // }

  create() {
    const sbCreate = this.customerService.create(this.huesped).pipe(
      tap(() => {
        this.modal.close();
      }),
      catchError((errorMessage) => {
        this.modal.dismiss(errorMessage);
        return of(this.huesped);
      }),
    ).subscribe((res: Huesped) => this.huesped = res);
    this.subscriptions.push(sbCreate);
  }

  // helpers for View
  isControlValid(controlName: string): boolean {
    const control = this.formGroup.controls[controlName];
    return control.valid && (control.dirty || control.touched);
  }

  isControlInvalid(controlName: string): boolean {
    const control = this.formGroup.controls[controlName];
    return control.invalid && (control.dirty || control.touched);
  }

  controlHasError(validation, controlName): boolean {
    const control = this.formGroup.controls[controlName];
    return control.hasError(validation) && (control.dirty || control.touched);
  }

  //FORMFACTURA
  isControlValidFactura(controlName: string): boolean {
    const control = this.facturacionFormGroup.controls[controlName];
    return control.valid && (control.dirty || control.touched);
  }

  isControlInvalidFactura(controlName: string): boolean {
    const control = this.facturacionFormGroup.controls[controlName];
    return control.invalid && (control.dirty || control.touched);
  }

  controlHasErrorFactura(validation, controlName): boolean {
    const control = this.facturacionFormGroup.controls[controlName];
    return control.hasError(validation) && (control.dirty || control.touched);
  }

  isControlTouched(controlName): boolean {
    const control = this.formGroup.controls[controlName];
    return control.dirty || control.touched;
  }

  onDateSelection(date: NgbDate) {
    if (!this.fromDate && !this.toDate) {
      this.fromDate = date;
    } else if (this.fromDate && !this.toDate && date && date.after(this.fromDate)) {
      this.toDate = date;
    } else {
      this.toDate = null;
      this.fromDate = date;
    }
  }


  validateInput(currentValue: NgbDate | null, input: string): NgbDate | null {
    const parsed = this.formatter.parse(input);
    return parsed && this.calendar.isValid(NgbDate.from(parsed)) ? NgbDate.from(parsed) : currentValue;
  }
  ngOnDestroy(): void {
    this.subscriptions.forEach(sb => sb.unsubscribe());
  }
}

