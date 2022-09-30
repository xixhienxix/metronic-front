import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { ReportesComponent } from './reportes.component';
import { CustomersComponent } from './customers/customers.component';


import { ClientesComponent } from './clientes/clientes.component';
// import { TarifarioComponent } from '../tarifas/tarifario/tarifario.component';

const routes: Routes = [
  {
    path: '',
    component: ReportesComponent,
    children: [
      {
        path: 'customers',
        component: CustomersComponent,
      },
      {
        path: 'clientes',
        component: ClientesComponent,
      },


      { path: '', redirectTo: 'customers', pathMatch: 'full' },
      { path: '**', redirectTo: 'customers', pathMatch: 'full' },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ReportesRoutingModule {}
