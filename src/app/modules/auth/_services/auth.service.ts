import { Injectable, OnDestroy } from '@angular/core';
import { Observable, BehaviorSubject, of, Subscription, Subject, throwError } from 'rxjs';
import { map, catchError, switchMap, finalize } from 'rxjs/operators';
import { UserModel } from '../_models/user.model';
import { environment } from 'src/environments/environment';
import { HttpClient } from '@angular/common/http';
import { JwtHelperService } from "@auth0/angular-jwt";

export interface AuthModel {
  _id:string,
  username:string,
  password:string,
  nombre:string,
  terminos:string,
  accessToken:string,
}

@Injectable({
  providedIn: 'root',
})
export class AuthService implements OnDestroy {
  isLoading$: Observable<boolean>
  // currentUserValue:Observable<boolean>
  currentUserSubject:BehaviorSubject<AuthModel>
  currentUser$:Observable<AuthModel>
  jwtHelper = new JwtHelperService();


  _hasError$:BehaviorSubject<boolean>= new BehaviorSubject<boolean>(false)
  // public hasErrorOnLogin: Observable<boolean> = this._hasError$.asObservable();

  get currentUserValue(): AuthModel {
    return this.currentUserSubject.value;
  }

  set currentUserValue(user: AuthModel) {
    this.currentUserSubject.next(user);
  }

  constructor(private http : HttpClient){
    this.currentUserSubject = new BehaviorSubject<AuthModel>(undefined);
    this.currentUser$ = this.currentUserSubject.asObservable();

  }

  login(username:string,password:string){
    this.logout()
    return this.http.post(environment.apiUrl+"/auth/login",{username,password})
    .pipe(catchError(err => 
      {
      // let errMessaje = 'Ocurrio un Error'
      if(err){

        this._hasError$.next(true)
        return throwError(err.statusText)
      }
    }),map((datosUsuario)=>{
      let usuario:AuthModel;
        for(var i in datosUsuario){
          if(datosUsuario.hasOwnProperty(i))
          {
             usuario = datosUsuario[i]
             this.currentUserSubject = new BehaviorSubject<AuthModel>(usuario);

          }
        }
      if(usuario){
        this.saveUserData(usuario)
        
        return usuario
      }

    }))
  } 

  olvidoPassword(email:string){
    return this.http.post(environment.apiUrl+"/auth/forgot",email)
  }

  registro(fullname:string,email:string,username:string,password:string,terminos:boolean)
  {
    return this.http.post(environment.apiUrl+"/auth/registro",{fullname,email,username,password,terminos})
    .pipe(map(res=>{
      let mensaje=null
      if(res){
        console.log(res)

        // this.saveUserData(res);

        return res
      }
      else {
        return mensaje ='No se pudo registrar al usuario'
      }
    }))
      
  }

  logout(){
    localStorage.removeItem('ACCESS_TOKEN')
    localStorage.removeItem('USER')
  }
  
  isTokenExpired():boolean{
    if(this.jwtHelper.isTokenExpired(localStorage.getItem('ACCESS_TOKEN')))
    {return true}
    else{return false}
  }

  jwtTokenHelper(rawToken:string)
  {
    const decodedToken = this.jwtHelper.decodeToken(rawToken);
    const expirationDate = this.jwtHelper.getTokenExpirationDate(rawToken);
    const isExpired = this.jwtHelper.isTokenExpired(rawToken);
  }

  getUserByToken(): Observable<UserModel> {
    const auth = this.getAuthFromLocalStorage();
    if (!auth )//|| !auth.authToken) 
    {
      return of(undefined);
    }
  }


  private getAuthFromLocalStorage(): AuthModel {
    try {
      // const authData = JSON.parse(
      //   localStorage.getItem('USER')
      // );
      return ;
    } catch (error) {
      // console.error(error);
      return undefined;
    }
  }

  saveUserData(data:any){
    localStorage.setItem('ACCESS_TOKEN',data.accessToken)
    localStorage.setItem('USER',JSON.stringify(data))
  }

  isAuthenticated():boolean
  {
    const expired = this.isTokenExpired()
    if(localStorage.getItem('ACCESS_TOKEN') && localStorage.getItem('ACCESS_TOKEN')!='undefined'&& !expired)
    {return true}
    else {return false}
   }

  ngOnDestroy(){

  }
}
