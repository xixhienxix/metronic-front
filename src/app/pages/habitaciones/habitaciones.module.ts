import { NgModule } from '@angular/core';
import { HttpClientModule } from '@angular/common/http';
import { InlineSVGModule } from 'ng-inline-svg';

import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgbNavModule, NgbTooltipModule } from '@ng-bootstrap/ng-bootstrap';
import { HighlightModule } from 'ngx-highlightjs';
// import { ECommerceComponent } from './reportes.component';

import { Injectable } from '@angular/core';
import { MatSlideToggleModule} from '@angular/material/slide-toggle';
import { MatTabsModule} from '@angular/material/tabs';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatIconModule } from '@angular/material/icon';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatButtonModule } from '@angular/material/button';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import {MatSelectModule} from '@angular/material/select'
import {MatListModule} from '@angular/material/list';
import { MatToolbarModule } from '@angular/material/toolbar';
import {MatDialogModule} from '@angular/material/dialog';
import { LOCALE_ID } from '@angular/core';
import { CommonModule, registerLocaleData } from '@angular/common';
import localeEs from '@angular/common/locales/es';

import {MatInputModule} from '@angular/material/input';
import {MatRadioModule} from '@angular/material/radio';

import {MatTableModule} from '@angular/material/table';
import {MatPaginatorModule} from '@angular/material/paginator';

import {MatProgressSpinnerModule} from '@angular/material/progress-spinner';
import { MatSortModule } from '@angular/material/sort';
import { HabitacionesComponent } from './habitaciones.component';
import { HabitacionesRoutingModule } from './habitaciones-routing.module';
import { CRUDTableModule } from 'src/app/_metronic/shared/crud-table';
import { AltaHabitacionComponent } from './components/alta-habitacion/alta-habitacion.component';
import { HabitacionMainComponent } from './main/habitacion-main/habitacion-main.component';
import { LoadingComponent } from './_helpers/loading/loading.component';
import { AgregarInventarioComponent } from './components/agregar-inventario/agregar-inventario.component';
import { SharedModule } from 'src/app/shared/shared.module';
import {BlockUIModule} from 'primeng/blockui';
import {PanelModule} from 'primeng/panel';
import { ReportesModule } from '../reportes/reportes.module';
import { InlineSpinnerComponent } from './components/helpers/inline-spinner/inline-spinner.component';

@NgModule({
  declarations: [
   HabitacionesComponent,
   AltaHabitacionComponent,
   HabitacionMainComponent,
   LoadingComponent,
   AgregarInventarioComponent,
   InlineSpinnerComponent,
   
      ],
  imports: [
    PanelModule,
    BlockUIModule,
    SharedModule,
    MatSlideToggleModule,
    CommonModule,
    FormsModule,
    CRUDTableModule,
    HighlightModule,
    NgbNavModule,
    NgbTooltipModule,
    HttpClientModule,
    FormsModule,
    ReactiveFormsModule,
    InlineSVGModule,
    MatTabsModule,
    MatCheckboxModule,
    MatExpansionModule,
    MatIconModule,
    MatDatepickerModule,
    MatFormFieldModule,
    MatButtonModule,
    MatAutocompleteModule,
    MatSelectModule,
    MatListModule,
    FormsModule,
    ReactiveFormsModule,
    MatToolbarModule,
    MatFormFieldModule,
    MatSelectModule,
    MatDialogModule,
    MatInputModule,
    MatRadioModule,
    MatTableModule,
    MatPaginatorModule,
    MatProgressSpinnerModule,
    MatSortModule,
    HabitacionesRoutingModule
       // RouterModule.forChild([
    //   {
    //     path: '',
    //     component: ReportesComponent,
    //   },
    // ]),
  ],

  entryComponents: [
    
  ],
  providers: [{ provide: LOCALE_ID, useValue: 'fr-FR' },
]
})
export class HabitacionesModule { }
