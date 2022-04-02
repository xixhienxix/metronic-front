import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { InlineSVGModule } from 'ng-inline-svg';
import { GeneralModule } from '../../_metronic/partials/content/general/general.module';
import { CRUDTableModule } from '../../_metronic/shared/crud-table';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgbDatepicker, NgbModule, NgbNavModule, NgbTooltipModule } from '@ng-bootstrap/ng-bootstrap';
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
import { registerLocaleData } from '@angular/common';
import localeEs from '@angular/common/locales/es';

import {MatInputModule} from '@angular/material/input';
import {MatRadioModule} from '@angular/material/radio';

import {MatTableModule} from '@angular/material/table';
import {MatPaginatorModule} from '@angular/material/paginator';

import {MatProgressSpinnerModule} from '@angular/material/progress-spinner';
import { MatSortModule } from '@angular/material/sort';
import { TarifasComponent } from './tarifas.component';
import { TarifasRoutingModule } from './tarifas.routing-module';
import { TarifaEspecialComponent } from './components/tarifa-especial/tarifa-especial.component';
import { TarifaExpressComponent } from './components/tarifa-express/tarifa-express.component';
import { EditExpressComponent } from './components/tarifa-express/edit-express/edit-express.component';
import { MainComponent } from './components/main/main.component';

// the second parameter 'fr' is optional
registerLocaleData(localeEs);

@NgModule({
  declarations: [
   TarifasComponent,
   TarifaEspecialComponent,
   TarifaExpressComponent,
   EditExpressComponent,
   MainComponent
      ],
  imports: [
    MatSlideToggleModule,
    GeneralModule,
    HighlightModule,
    NgbNavModule,
    NgbTooltipModule,
    CommonModule,
    HttpClientModule,
    FormsModule,
    ReactiveFormsModule,
    InlineSVGModule,
    CRUDTableModule,
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
    MatToolbarModule,
    MatDialogModule,
    MatInputModule,
    MatRadioModule,
    MatTableModule,
    MatPaginatorModule,
    MatProgressSpinnerModule,
    MatSortModule,
    TarifasRoutingModule,
    NgbModule,

  ],

  entryComponents: [

  ],
  providers: [{ provide: LOCALE_ID, useValue: 'fr-FR' },
]
})
// @Injectable({
//   providedIn: 'root',
// })
export class TarifasModule {}
