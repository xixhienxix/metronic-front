import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { AuthGuard } from '../modules/auth/_services/auth.guard';
import { LayoutComponent } from './_layout/layout.component';


const routes: Routes = [
  {
    
    path: '',
    component: LayoutComponent,
    canActivate:[AuthGuard],
    children: [
      {
        path: 'reportes',
      loadChildren: () =>
        import('./reportes/reportes.module').then((m) => m.ReportesModule),
      },
      {
        path: 'habitacion',
      loadChildren: () =>
        import('./habitaciones/habitaciones.module').then((m) => m.HabitacionesModule),
      },
      {
        path:'tarifas/tarifario',
        loadChildren:()=>
        import('./tarifas/tarifas.module').then((m) => m.TarifasModule),
      },
      {
      path: 'dashboard',
      loadChildren: () =>
        import('./dashboard/dashboard.module').then((m) => m.DashboardModule),
    },    
    {
      path: 'builder',
      loadChildren: () =>
        import('./builder/builder.module').then((m) => m.BuilderModule),
    },
    { 
      path: 'parametros',
      loadChildren: () =>
        import('./parametros/parametros.module').then((m) => m.ParametrosModule),
    },
    { 
      path: 'calendario',
      loadChildren: () =>
        import('./calendario/calendario.module').then((m) => m.CalendarioModule),
    },
      
//    {
//        path: 'ecommerce',
//        loadChildren: () =>
//          import('../modules/e-commerce/e-commerce.module').then(
//            (m) => m.ECommerceModule
//          ),
//      },
//      {
//        path: 'user-management',
//        loadChildren: () =>
//          import('../modules/user-management/user-management.module').then(
      //       (m) => m.UserManagementModule
      //     ),
      // },
      // {
      //   path: 'user-profile',
      //   loadChildren: () =>
      //     import('../modules/user-profile/user-profile.module').then(
      //       (m) => m.UserProfileModule
      //     ),
      // },
      // {
      //   path: 'ngbootstrap',
      //   loadChildren: () =>
      //     import('../modules/ngbootstrap/ngbootstrap.module').then(
      //       (m) => m.NgbootstrapModule
      //     ),
      // },
      // {
      //   path: 'wizards',
      //   loadChildren: () =>
      //     import('../modules/wizards/wizards.module').then(
      //       (m) => m.WizardsModule
      //     ),
      // },
      // {
      //   path: 'reports',
      //   loadChildren: () =>
      //     import('../modules/reportes/reportes.module').then(
      //       (m) => m.ReportsModule
      //     ),
      // },
      // {
      //   path: 'material',
      //   loadChildren: () =>
      //     import('../modules/material/material.module').then(
      //       (m) => m.MaterialModule
      //     ),
      // },
      {
        path: '',
        redirectTo: '/auth/login',
        pathMatch: 'full',
      },
      {
        path: '**',
        redirectTo: 'error/404',
      },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class PagesRoutingModule { }