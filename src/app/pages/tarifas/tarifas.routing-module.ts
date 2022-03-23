import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
// import { TarifarioComponent } from './tarifario/tarifario.component';
import { TarifasComponent } from './tarifas.component';


const routes: Routes = [
  {
    path: '',
    component: TarifasComponent,
    children: [
      // {
      //   path: 'habitaciones',
      //   component: TarifarioComponent,
      // },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class TarifasRoutingModule {}
