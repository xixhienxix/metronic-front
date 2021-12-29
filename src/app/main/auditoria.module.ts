import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AlertsComponent } from './alerts/alerts.component';
import {MatProgressBarModule} from '@angular/material/progress-bar';



@NgModule({
  declarations: [AlertsComponent],
  imports: [
    MatProgressBarModule,
    CommonModule
  ]
})
export class AuditoriaModule { }
