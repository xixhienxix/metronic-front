import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { GeneralModule } from '../../_metronic/partials/content/general/general.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgbNavModule, NgbTooltipModule } from '@ng-bootstrap/ng-bootstrap';
import { HighlightModule } from 'ngx-highlightjs';
import { ParametrosComponent } from './parametros.component';

@NgModule({
  declarations: [ParametrosComponent],
  imports: [
    CommonModule,
    FormsModule,
    GeneralModule,
    HighlightModule,
    NgbNavModule,
    NgbTooltipModule,
    FormsModule, 
    ReactiveFormsModule,
    RouterModule.forChild([
      {
        path: '',
        component: ParametrosComponent,
      },
    ]),
  ],
})
export class ParametrosModule {}
