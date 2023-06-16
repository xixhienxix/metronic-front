import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { CalendarioComponent } from './calendario.component';

const routes: Routes = [
  {
    path: '',
    component: CalendarioComponent,
    children: [

      { path: '', redirectTo: 'calendario', pathMatch: 'full' },
      { path: '**', redirectTo: 'calendario', pathMatch: 'full' },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class CalendarioRoutingModule { }
