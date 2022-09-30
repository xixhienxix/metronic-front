import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup, FormGroupDirective, NgForm, Validators } from '@angular/forms';
import { ModalDismissReasons, NgbActiveModal, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { Subscription } from 'rxjs';
import { AlertsComponent } from 'src/app/main/alerts/alerts.component';
import { Habitacion } from '../../_models/habitacion';
import { Tipos_Habitacion } from '../../_models/tipos';
import { HabitacionesService } from '../../_services/habitaciones.service';
import { TiposService } from '../../_services/tipos.service';
import { NoWhiteSpacesValidator } from '../../_validators/nonwhitespaces.validator/nonwhitespaces.validator.component';



@Component({
  selector: 'app-agregar-inventario',
  templateUrl: './agregar-inventario.component.html',
  styleUrls: ['./agregar-inventario.component.scss'],
  encapsulation: ViewEncapsulation.None,
})


export class AgregarInventarioComponent implements OnInit {

  habitacion:Habitacion
  quantityInv:number=1;

  /**FormGroup */
  formGroup:FormGroup
  inputForm:FormGroup;

  /**Arrays */
  tiposArr:Tipos_Habitacion[]=[]
  nombreHabs:[]=[]

  /**Subscription */
  subscriptions:Subscription[]=[]

  /**DOM */
  nombresIguales:boolean=false
  closeResult:string;
  isLoading:boolean=false
  
  constructor(public modal : NgbActiveModal,
    public fb : FormBuilder,
    public tiposHabitacionService:TiposService,
    public habitacionService:HabitacionesService,
    public modalService :NgbModal,

    ) { }
    
    get inputs() {
      return this.formGroup.controls["nombreHabs"] as FormArray;
    }
    
    ngOnInit(): void {
      // this.getTiposHAB();

      this.formGroup = this.fb.group({
        // etiqueta: ['', Validators.compose([Validators.required, Validators.minLength(3), Validators.maxLength(100),NoWhiteSpacesValidator.cannotContainSpace])],
        // tipo: ['', Validators.compose([Validators.required, Validators.minLength(3), Validators.maxLength(100)])],
        nombreHabs: this.fb.array([]),
        inventario: [1, Validators.required],

      })
      this.inputForm = this.fb.group({
        nombreHabs: ['',],
      });

      this.inputs.push(this.inputForm);


    }

    onSubmit(){
      let habitacionNueva:Habitacion

      if(this.formGroup.invalid){
        this.findInvalidControls()
        Object.keys(this.formGroup.controls).forEach(key => {
          this.formGroup.get(key).markAsDirty();
        });
        return
      }


      habitacionNueva = {
        Codigo:this.habitacion.Codigo,
        Numero:this.formGroup.value.nombreHabs,
        Descripcion:this.habitacion.Descripcion,
        Tipo:this.habitacion.Tipo,
        Personas:this.habitacion.Personas,
        Personas_Extra:this.habitacion.Personas,
        Inventario:this.quantityInv,
        Vista:this.habitacion.Vista,
        Camas:this.habitacion.Camas,
        Tipos_Camas:this.habitacion.Tipos_Camas,
        Amenidades:this.habitacion.Amenidades,
        Orden:this.habitacion.Orden,
        Tarifa:this.habitacion.Tarifa
      }
      this.isLoading=true

      const sb =  this.habitacionService.agregarInventario(habitacionNueva,this.habitacion.Inventario).subscribe(
        (value)=>{
          this.isLoading=false
          const modalRef = this.modalService.open(AlertsComponent,{ size: 'sm', backdrop:'static' })
          modalRef.componentInstance.alertHeader = 'Exito'
          modalRef.componentInstance.mensaje='Habitación(es) Generadas con éxito'          
          modalRef.result.then((result) => {
            this.closeResult = `Closed with: ${result}`;
            }, (reason) => {
                this.closeResult = `Dismissed ${this.getDismissReason(reason)}`;
            });
            setTimeout(() => {
              modalRef.close('Close click');
            },4000)
              this.modal.close()

          },
        (error)=>{
          this.isLoading=false
          const modalRef = this.modalService.open(AlertsComponent,{ size: 'sm', backdrop:'static' })
          modalRef.componentInstance.alertHeader = 'Error'
          modalRef.componentInstance.mensaje='No se pudo guardar la habitación intente de nuevo mas tarde'
          modalRef.result.then((result) => {
            this.closeResult = `Closed with: ${result}`;
            }, (reason) => {
                this.closeResult = `Dismissed ${this.getDismissReason(reason)}`;
            });
            setTimeout(() => {
              modalRef.close('Close click');
            },4000)
            return
        }
      )   
    }


    public findInvalidControls() {
      const invalid = [];
      const controls = this.formGroup.controls;
      for (const name in controls) {
          if (controls[name].invalid) {
              invalid.push(name);
          }
      }
      return invalid;
  }

    removeInput(){
    
      if(this.quantityInv>1)
        {
        this.quantityInv--;
        this.inputs.removeAt(this.quantityInv-1);
  
        }
        else
        {this.quantityInv}
  
        this.formGroup.controls['inventario'].patchValue(this.quantityInv)
  
    }

    // getTiposHAB(){
    //   const sb = this.tiposHabitacionService.getTiposDeCuarto().subscribe(
    //     (value)=>{ 
    //       if(value){this.tiposArr=value} 
    //   },
    //   (error)=>{
  
    //   }
    //   )
  
    //   this.subscriptions.push(sb)
  
    // }

    addInput(){

      this.quantityInv++;
      this.formGroup.controls['inventario'].patchValue(this.quantityInv)
  
        this.inputForm = this.fb.group({
          nombreHabs: [''],
      });
  
      this.inputs.push(this.inputForm);
    }

    // FormHelpers
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

    isErrorState(control: FormControl | null, form: FormGroupDirective | NgForm | null): boolean {
        const invalidCtrl = !!(control?.invalid && control?.parent?.dirty);
        const invalidParent = !!(control?.parent?.invalid && control?.parent?.dirty);
    
        return invalidCtrl || invalidParent;
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

    closeModal(){
      this.modal.close();
    }


}
