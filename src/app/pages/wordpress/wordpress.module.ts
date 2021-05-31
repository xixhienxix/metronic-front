import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { WordpressComponent } from './wordpress.component';

@NgModule({
  declarations: [WordpressComponent],
  imports: [
    CommonModule,
    RouterModule.forChild([
      {
        path: '',
        component: WordpressComponent,
      },
    ]),
  ],
})
export class DashboardModule {}
