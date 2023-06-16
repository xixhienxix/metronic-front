import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { CalendarioRoutingModule } from './calendario-routing.module';
import { CalendarioComponent } from './calendario.component';
import { RouterModule } from '@angular/router';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatTableModule } from '@angular/material/table';


@NgModule({
  declarations: [CalendarioComponent],
  imports: [
    CommonModule,
    MatButtonToggleModule,
    MatTableModule,
    CalendarioRoutingModule,
    RouterModule.forChild([
      {
        path: '',
        component: CalendarioComponent,
      },
    ]),
  ]
})
export class CalendarioModule { }
