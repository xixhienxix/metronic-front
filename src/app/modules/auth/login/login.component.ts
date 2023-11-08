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
    private _parametrosService : ParametrosServiceService
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
    const usuario = this.f.username.value.toLowerCase();
    var hotel
    const sb = this.authService.login(usuario,this.f.password.value).subscribe(
      (value)=> 
      {
        if(value=='usuario inexistente'){
          alert('Usuario o Contraseña Incorrectos')
          
        }else 
        if(value)
        {
          if(this.authService.currentUserValue.hotel){
            hotel = this.authService.currentUserValue.hotel.replace(/\s/g, '_');
          }
          else {
            alert('Usuario o Contraseña Incorrectos')
            this.loading=false
            return
          }
        this._parametrosService.getParametros(hotel).pipe(takeUntil(this.ngUnsubscribe)).subscribe(
          (value)=>{

              this._parametrosService.getCurrentParametrosValue
              sessionStorage.setItem("HOTEL",this._parametrosService.getCurrentParametrosValue.hotel)

              this.router.navigate(['/calendario'])// /calendario

          },
          (error)=>{
            console.log(error)
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
