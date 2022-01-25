import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NgbActiveModal, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { Subscription } from 'rxjs';
import { AuthService } from 'src/app/modules/auth';
import { AlertsComponent } from '../../../../../../main/alerts/alerts.component';

@Component({
  selector: 'app-super.user',
  templateUrl: './super.user.component.html',
  styleUrls: ['./super.user.component.scss']
})
export class SuperUserComponent implements OnInit {
  @Output() passEntry: EventEmitter<any> = new EventEmitter();

  modalService:NgbModal
  isLoading:boolean=false
  autorizaForm:FormGroup;

  /**Subscriptions */
  private subscription:Subscription[]=[]

  constructor(
    public fb : FormBuilder,
    private authService : AuthService,
    public modal:NgbActiveModal
  ) { }

  ngOnInit(): void {
    this.autorizaForm =  this.fb.group({
      usuario:['',Validators.compose([Validators.required, Validators.minLength(3), Validators.maxLength(100)])],
      password:['',Validators.compose([Validators.required, Validators.minLength(3), Validators.maxLength(100)])]
    })
  }
  get getAutorizaForm(){return this.autorizaForm.controls }

  onSubmit(){
    this.isLoading=true

    const sb = this.authService.autoriza(this.getAutorizaForm.usuario.value,this.getAutorizaForm.password.value).subscribe(
      (value:any)=>{
        this.isLoading=false
        
          this.passBack(value)
          this.modal.close()
        
      },
      (error)=>
      {
        this.isLoading=false

        if (error)
        {
          const modalRef = this.modalService.open(AlertsComponent,{ size: 'sm', backdrop:'static' })
          modalRef.componentInstance.alertHeader='Error'
          modalRef.componentInstance.mensaje='Ocurrio un Error intente de nuevo mas tarde'
        }
      }
      )

      this.subscription.push(sb);

  }

  close(){
    this.modal.close();
  }

  passBack(exito:string) {
    this.passEntry.emit(exito);
    }

  /*Form Helpers */
  isControlValid(controlName: string): boolean {
    const control = this.autorizaForm.controls[controlName];
    return control.valid && (control.dirty || control.touched);
  }

  isControlInvalid(controlName: string): boolean {
    const control = this.autorizaForm.controls[controlName];

    return control.invalid && (control.dirty || control.touched);
  }
  controlHasError(validation, controlName): boolean {
    const control = this.autorizaForm.controls[controlName];
    return control.hasError(validation) && (control.dirty || control.touched);
  }

  ngOnDestroy(): void {
    this.subscription.forEach(sb => sb.unsubscribe());
  }

}
