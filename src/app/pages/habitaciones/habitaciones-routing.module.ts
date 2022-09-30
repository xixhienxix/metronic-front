import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { HabitacionesComponent } from './habitaciones.component';
import { AltaHabitacionComponent } from './components/alta-habitacion/alta-habitacion.component';
import { HabitacionMainComponent } from './main/habitacion-main/habitacion-main.component';

const routes: Routes = [
  {
    path: '',
    component: HabitacionesComponent,
    children: [
      {
        path:'main',
        component:HabitacionMainComponent
      },
      {
        path: 'alta',
        component: AltaHabitacionComponent,
      },
      
        { path: '', redirectTo: 'main', pathMatch: 'full' },
        { path: '**', redirectTo: 'main', pathMatch: 'full' },
      
    ],
    
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class HabitacionesRoutingModule { }
