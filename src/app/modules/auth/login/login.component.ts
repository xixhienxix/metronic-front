import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Subscription, Observable, BehaviorSubject } from 'rxjs';
import { delay, first } from 'rxjs/operators';
import { UserModel } from '../_models/user.model';
import { AuthService } from '../_services/auth.service';
import { ActivatedRoute, Router } from '@angular/router';

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

  constructor(
    private fb: FormBuilder,
    public authService: AuthService,
    private route: ActivatedRoute,
    private router: Router,
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
          Validators.maxLength(10), 
        ]),
      ],
      password: [
        '',
        Validators.compose([
          Validators.required,
          Validators.minLength(3),
          Validators.maxLength(10),
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
          this.router.navigate(['reportes/customers'])
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
  }
}
