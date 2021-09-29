import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NgbActiveModal, NgbCalendar, NgbDate, NgbDateParserFormatter, NgbDatepickerI18n } from '@ng-bootstrap/ng-bootstrap';
import { of, Subscription } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { Huesped } from 'src/app/pages/reportes/_models/customer.model';
import { HuespedService } from 'src/app/pages/reportes/_services';
import { EditReservaModalComponent } from '../../../edit-reserva-modal.component';

@Component({
  selector: 'app-huesped-component',
  templateUrl: './huesped-component.component.html',
  styleUrls: ['./huesped-component.component.scss']
})
export class HuespedComponentComponent implements OnInit {
  
  /**DATES */
  fromDate: NgbDate | null;
  toDate: NgbDate | null;
  fechaFinalBloqueo:string
  fechaInicialBloqueo:string
  hoveredDate: NgbDate | null = null;
  fullFechaSalida:string
  fullFechaLlegada:string

  formGroup: FormGroup;

  /*Models*/
  huesped:Huesped

  /*Diseño Dinamico*/
  modifica:boolean = true;
  
  private subscriptions: Subscription[] = [];

  constructor(
    public formatter: NgbDateParserFormatter,
    private customerService:HuespedService,
    private calendar : NgbCalendar,
    private i18n:NgbDatepickerI18n,
    public modal: NgbActiveModal,
    public editService:EditReservaModalComponent,
    public fb : FormBuilder
  ) 
  {  
    this.fromDate = calendar.getToday();
    this.toDate = calendar.getNext(calendar.getToday(), 'd', 1); 
    this.fechaFinalBloqueo=this.toDate.day+" de "+this.i18n.getMonthFullName(this.toDate.month)+" del "+this.toDate.year 
  }

  ngOnInit(): void {
    this.editService.huespedUpdate$.subscribe((value)=>{
      console.log(value)
      this.huesped=value
    })
    
    this.formatFechas();
    this.loadForm();
  }

  loadForm() {

    this.formGroup = this.fb.group({
      nombre: [this.huesped.nombre, Validators.compose([Validators.required, Validators.minLength(3), Validators.maxLength(100)])],
      email: [this.huesped.email, Validators.compose([Validators.email,Validators.pattern("^[a-z0-9._%+-]+@[a-z0-9.-]+\\.[a-z]{2,4}$"),Validators.minLength(3),Validators.maxLength(50)])],
      telefono: [this.huesped.telefono, Validators.compose([Validators.nullValidator,Validators.minLength(10),Validators.maxLength(14)])],
      trabajaEn: [this.huesped.trabajaEn, Validators.compose([Validators.nullValidator,Validators.minLength(3),Validators.maxLength(100)])],
      fechaNacimiento: [this.huesped.fechaNacimiento, Validators.compose([Validators.nullValidator,Validators.minLength(3),Validators.maxLength(100)])],
      tipoDeID: [this.huesped.tipoDeID, Validators.compose([Validators.nullValidator,Validators.minLength(3),Validators.maxLength(100)])],
      numeroDeID: [this.huesped.numeroDeID, Validators.compose([Validators.nullValidator,Validators.minLength(3),Validators.maxLength(100)])],
      direccion: [this.huesped.direccion, Validators.compose([Validators.nullValidator,Validators.minLength(3),Validators.maxLength(100)])],
      pais: [this.huesped.pais, Validators.compose([Validators.nullValidator,Validators.minLength(3),Validators.maxLength(100)])],
      ciudad: [this.huesped.ciudad, Validators.compose([Validators.nullValidator,Validators.minLength(3),Validators.maxLength(100)])],
      codigoPostal: [this.huesped.codigoPostal, Validators.compose([Validators.nullValidator,Validators.minLength(3),Validators.maxLength(100)])],
      lenguaje: [this.huesped.lenguaje, Validators.compose([Validators.nullValidator,Validators.minLength(3),Validators.maxLength(100)])],
    });
  }

  formatFechas()
    {
      const diaLlegada = parseInt(this.huesped.llegada.split("/")[0])
      const mesLlegada = parseInt(this.huesped.llegada.split("/")[1])
      const anoLlegada = parseInt(this.huesped.llegada.split("/")[2])
      const fechaLlegada = new Date(anoLlegada,mesLlegada,diaLlegada)
      this.fullFechaLlegada = fechaLlegada.getUTCDate().toString() + "/" + this.i18n.getMonthShortName(fechaLlegada.getUTCMonth()) + "/" + fechaLlegada.getFullYear().toString()

      const diaSalida = parseInt(this.huesped.salida.split("/")[0])
      const mesSalida = parseInt(this.huesped.salida.split("/")[1])
      const anoSalida = parseInt(this.huesped.salida.split("/")[2])
      const fechaSalida = new Date(anoSalida,mesSalida,diaSalida)
      this.fullFechaSalida = fechaSalida.getUTCDate().toString() + "/" + this.i18n.getMonthShortName(fechaSalida.getUTCMonth()) + "/" + fechaSalida.getFullYear().toString()
    }

  save() {
    this.prepareHuesped();
    this.create();
  }

  private prepareHuesped() {

    const formData = this.formGroup.value;


    this.huesped.llegada = this.fromDate.toString();
    this.huesped.salida = this.toDate.toString();
    this.huesped.nombre = formData.nombre;

        this.huesped.llegada=this.fromDate.day+'/'+this.fromDate.month+'/'+this.fromDate.year
        this.huesped.salida=this.toDate.day+'/'+this.toDate.month+'/'+this.toDate.year
        this.huesped.noches=(this.fromDate.day)-(this.toDate.day)
        this.huesped.porPagar=this.huesped.tarifa*this.huesped.noches
        this.huesped.pendiente=this.huesped.tarifa*this.huesped.noches
        this.huesped.habitacion=formData.habitacion
        this.huesped.telefono=formData.telefono
        this.huesped.email=formData.email
        this.huesped.motivo=formData.motivo
        this.huesped.id=this.huesped.folio

    this.customerService.addPost(this.huesped);
      console.log("AddPost Succesfull")


  }
  
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

  isRange(date: NgbDate) {
    return date.equals(this.fromDate) || (this.toDate && date.equals(this.toDate)) || this.isInside(date) || this.isHovered(date);
  }

  isHovered(date: NgbDate) {
    return this.fromDate && !this.toDate && this.hoveredDate && date.after(this.fromDate) && date.before(this.hoveredDate);
  }

  isInside(date: NgbDate) {
    return this.toDate && date.after(this.fromDate) && date.before(this.toDate);
  }

  validateInput(currentValue: NgbDate | null, input: string): NgbDate | null {
    const parsed = this.formatter.parse(input);
    return parsed && this.calendar.isValid(NgbDate.from(parsed)) ? NgbDate.from(parsed) : currentValue;
  }
  ngOnDestroy(): void {
    this.subscriptions.forEach(sb => sb.unsubscribe());
  }
}

