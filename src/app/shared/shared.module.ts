import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { SharedRoutingModule } from './shared-routing.module';
import { LoadingSpinnerComponent } from '../pages/reportes/helpers/loader-spinner/loader-spinner.component';


@NgModule({
  declarations: [LoadingSpinnerComponent],
  imports: [
    CommonModule,
    SharedRoutingModule,

  ],
  exports:[LoadingSpinnerComponent]

})
export class SharedModule { }
