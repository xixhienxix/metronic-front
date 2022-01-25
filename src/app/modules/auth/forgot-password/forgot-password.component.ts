import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Observable, Subscription } from 'rxjs';
import { AuthService } from '../_services/auth.service';
import { first } from 'rxjs/operators';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { AlertsComponent } from 'src/app/main/alerts/alerts.component';
enum ErrorStates {
  NotSubmitted,
  HasError,
  NoError,
}

@Component({
  selector: 'app-forgot-password',
  templateUrl: './forgot-password.component.html',
  styleUrls: ['./forgot-password.component.scss'],
})
export class ForgotPasswordComponent implements OnInit {
  forgotPasswordForm: FormGroup;
  errorState: ErrorStates = ErrorStates.NotSubmitted;
  errorStates = ErrorStates;
  isLoading$: Observable<boolean>;
  isLoading:boolean=false

  // private fields
  private unsubscribe: Subscription[] = []; // Read more: => https://brianflove.com/2016/12/11/anguar-2-unsubscribe-observables/
  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private modalService : NgbModal
  ) {
    this.isLoading$ = this.authService.isLoading$;
  }

  ngOnInit(): void {
    this.initForm();
  }
  ngOnDestroy():void
  {
    this.unsubscribe.forEach(sb=>sb.unsubscribe())
  }
  // convenience getter for easy access to form fields
  get f() {
    return this.forgotPasswordForm.controls;
  }

  initForm() {
    this.forgotPasswordForm = this.fb.group({
      email: [
        '',
        Validators.compose([
          Validators.required,
          Validators.email,
          Validators.minLength(3),
          Validators.maxLength(320), 
        ]),
      ],
    });
  }

  submit() {
    this.errorState = ErrorStates.NotSubmitted;
    this.isLoading=true

    const forgotPasswordSubscr = this.authService.olvidoPassword(this.f.email.value).subscribe(
      (value)=>{
        this.isLoading=false

        const modalRef = this.modalService.open(AlertsComponent,{ size: 'sm', backdrop:'static' })
        modalRef.componentInstance.alertHeader = 'Email Enviado'
        modalRef.componentInstance.mensaje = 'Contraseña enviada al correo '+this.f.email.value

      },
      (error)=>{
        this.isLoading=false

        if(error){
          const modalRef = this.modalService.open(AlertsComponent,{ size: 'sm', backdrop:'static' })
          modalRef.componentInstance.alertHeader = 'Error'
          modalRef.componentInstance.mensaje = 'Error al enviar contraseña al correo '+this.f.email.value
        }
      }
      )
    // const forgotPasswordSubscr = this.authService
    //   .forgotPassword(this.f.email.value)
    //   .pipe(first())
    //   .subscribe((result: boolean) => {
    //     this.errorState = result ? ErrorStates.NoError : ErrorStates.HasError;
    //   });
    // this.unsubscribe.push(forgotPasswordSubscr);
       
    this.unsubscribe.push(forgotPasswordSubscr);
    this.isLoading=false

  }

}
