import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { AltaHabitacionComponent } from '../habitaciones/components/alta-habitacion/alta-habitacion.component';
import { HabitacionesComponent } from '../habitaciones/habitaciones.component';
import { HabitacionMainComponent } from '../habitaciones/main/habitacion-main/habitacion-main.component';
import { MainComponent } from './components/main/main.component';
// import { TarifarioComponent } from './tarifario/tarifario.component';
import { TarifasComponent } from './tarifas.component';


const routes: Routes = [
  {
    path: '',
    component: TarifasComponent,
    children: [
      {
        path:'tarifario',
        component:MainComponent
      },
      {
        path: 'alta',
        component: AltaHabitacionComponent,
      },
      
        { path: '', redirectTo: 'tarifario', pathMatch: 'full' },
        { path: '**', redirectTo: 'tarifario', pathMatch: 'full' },
      
    ],
    
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class TarifasRoutingModule {}
