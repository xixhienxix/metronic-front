import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { WordpressComponent } from './wordpress.component';

const routes: Routes = [
  {
    path: '',
    component: WordpressComponent,
    children: [
      { path: '', redirectTo: 'profile-overview', pathMatch: 'full' },
      { path: '**', redirectTo: 'profile-overview', pathMatch: 'full' },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class WordpressRoutingComponent { }
