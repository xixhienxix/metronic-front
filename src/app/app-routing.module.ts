import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { AuthGuard } from './modules/auth/_services/auth.guard';

export const routes: Routes = [
  {
    path: 'auth',
    loadChildren: () =>
      import('./modules/auth/auth.module').then((m) => m.AuthModule),
  },
  {
    path: 'error',
    loadChildren: () =>
      import('./modules/errors/errors.module').then((m) => m.ErrorsModule),
  },
  {
    path: '',
    canActivate: [AuthGuard],
    loadChildren: () =>
      import('./pages/layout.module').then((m) => m.LayoutModule),
  },
  {
    path:'tarifas',
    canActivate: [AuthGuard],
    redirectTo: 'tarifas/tarifario' 
  },
  {
  path:'reportes',
  canActivate: [AuthGuard],
  redirectTo: 'reportes/customers' 
  },
  {
    path:'parametros',
    canActivate: [AuthGuard],
    redirectTo: 'parametros' 
  },
  // {
  //   path:'clientes',
  //   canActivate: [AuthGuard],
  //   redirectTo: 'reportes/clientes' 
  // },
  {
    path:'habitacion',
    canActivate: [AuthGuard],
    redirectTo: 'habitacion/main' 
  },
  { path: '**',   
  redirectTo: 'auth/login' 
},
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule { }
