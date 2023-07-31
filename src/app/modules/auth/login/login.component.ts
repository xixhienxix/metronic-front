import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Subscription, Observable, BehaviorSubject, Subject } from 'rxjs';
import { delay, first, takeUntil } from 'rxjs/operators';
import { UserModel } from '../_models/user.model';
import { AuthService } from '../_services/auth.service';
import { ActivatedRoute, Router } from '@angular/router';
import { ParametrosServiceService } from 'src/app/pages/parametros/_services/parametros.service.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
})
export class LoginComponent implements OnInit, OnDestroy {

  loginForm: FormGroup;
  returnUrl: string;
  isLoading$: Observable<boolean>;
  isLoading:boolean

  loading:boolean;
  message: any;
  // private fields
  private unsubscribe: Subscription[] = [];
  private ngUnsubscribe = new Subject<void>();


  constructor(
    private fb: FormBuilder,
    public authService: AuthService,
    private route: ActivatedRoute,
    private router: Router,
    private parametrosService : ParametrosServiceService
  ) {

  }

  ngOnInit(): void {
    this.initForm();
  }

  // convenience getter for easy access to form fields
  get f() {
    return this.loginForm.controls;
  }

  initForm() {
    this.loginForm = this.fb.group({
      username: [
        '',
        Validators.compose([
          Validators.required,
          Validators.minLength(3),
          Validators.maxLength(20),
        ]),
      ],
      password: [
        '',
        Validators.compose([
          Validators.required,
          Validators.minLength(3),
          Validators.maxLength(15),
        ]),
      ],
    });
  }

  submit() {
    this.isLoading=true
    const sb = this.authService.login(this.f.username.value,this.f.password.value).subscribe(
      (value)=>
      {
        if(value)
        {
        this.parametrosService.getParametros(this.authService.currentUserValue.hotel).pipe(takeUntil(this.ngUnsubscribe)).subscribe(
          (value1)=>{
              this.parametrosService.getCurrentParametrosValue
              this.router.navigate(['/reportes'])// /calendario

          },
          (error)=>{
          })
        }
        this.isLoading=false
      },
      (err)=>{
        if(err)
        {
          if(err.statusText=='Uknown Error')
          {          this.message='Fallo en la solicitud intente de nuevo mas tarde'        }
          else {           this.message='Usuario o Contraseña Incorrectos'        }
        }
        this.isLoading = false;
      },
      ()=>{
        console.log('finalize')
      })
      this.unsubscribe.push(sb)
  }


  ngOnDestroy() {
    this.unsubscribe.forEach((sb) => sb.unsubscribe());
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }
}
