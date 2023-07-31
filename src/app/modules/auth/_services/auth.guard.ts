import { Injectable } from '@angular/core';
import {
  Router,
  CanActivate,
  ActivatedRouteSnapshot,
  RouterStateSnapshot,
} from '@angular/router';
import { AuthService } from './auth.service';
import { ParametrosServiceService } from 'src/app/pages/parametros/_services/parametros.service.service';


@Injectable({ providedIn: 'root' })
export class AuthGuard implements CanActivate {
  constructor(private authService: AuthService, private router:Router, 
    ) {}

  canActivate():boolean{
      if(this.authService.isAuthenticated())
      {
        return true
      }
      else 
      this.router.navigate(['/auth/login'])
      return false  

  }

}