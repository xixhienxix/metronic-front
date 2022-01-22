import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { InlineSVGModule } from 'ng-inline-svg';
import { CustomersComponent } from './customers/customers.component';
import { RouterModule } from '@angular/router';
import { ProductsComponent } from './products/products.component';
import { GeneralModule } from '../../_metronic/partials/content/general/general.module';
import { CRUDTableModule } from '../../_metronic/shared/crud-table';
import { ReportesComponent } from './reportes.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgbNavModule, NgbTooltipModule } from '@ng-bootstrap/ng-bootstrap';
import { HighlightModule } from 'ngx-highlightjs';
// import { ECommerceComponent } from './reportes.component';
import { ReportesRoutingModule } from './reportes-routing.module';
import { DeleteHuespedModalComponent } from './customers/components/delete-customer-modal/delete-customer-modal.component';
import { DeleteHuespedesModalComponent } from './customers/components/delete-customers-modal/delete-customers-modal.component';
import { FetchCustomersModalComponent } from './customers/components/fetch-customers-modal/fetch-customers-modal.component';
import { UpdateCustomersStatusModalComponent } from './customers/components/update-customers-status-modal/update-customers-status-modal.component';
import { NuevaReservaModalComponent } from './customers/components/nueva-reserva-modal/nueva-reserva-modal.component';
import { NgbDatepickerModule, NgbModalModule } from '@ng-bootstrap/ng-bootstrap';
import { DeleteProductModalComponent } from './products/components/delete-product-modal/delete-product-modal.component';
import { DeleteProductsModalComponent } from './products/components/delete-products-modal/delete-products-modal.component';
import { UpdateProductsStatusModalComponent } from './products/components/update-products-status-modal/update-products-status-modal.component';
import { FetchProductsModalComponent } from './products/components/fetch-products-modal/fetch-products-modal.component';
import { ProductEditComponent } from './products/product-edit/product-edit.component';
import { RemarksComponent } from './products/product-edit/remarks/remarks.component';
import { SpecificationsComponent } from './products/product-edit/specifications/specifications.component';
import { DeleteRemarkModalComponent } from './products/product-edit/remarks/delete-remark-modal/delete-remark-modal.component';
import { DeleteRemarksModalComponent } from './products/product-edit/remarks/delete-remarks-modal/delete-remarks-modal.component';
import { FetchRemarksModalComponent } from './products/product-edit/remarks/fetch-remarks-modal/fetch-remarks-modal.component';
import { DeleteSpecModalComponent } from './products/product-edit/specifications/delete-spec-modal/delete-spec-modal.component';
import { DeleteSpecsModalComponent } from './products/product-edit/specifications/delete-specs-modal/delete-specs-modal.component';
import { FetchSpecsModalComponent } from './products/product-edit/specifications/fetch-specs-modal/fetch-specs-modal.component';
import { EditRemarkModalComponent } from './products/product-edit/remarks/edit-remark-modal/edit-remark-modal.component';
import { EditSpecModalComponent } from './products/product-edit/specifications/edit-spec-modal/edit-spec-modal.component';
import { Injectable } from '@angular/core';
import { MessagesComponent } from './messages/messages.component';
import { EditReservaModalComponent } from './customers/components/edit-reserva-modal/edit-reserva-modal.component';
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
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MatToolbarModule } from '@angular/material/toolbar';
import {MatDialogModule} from '@angular/material/dialog';
import {MatMenuTrigger} from '@angular/material/menu';
import { DialogComponent } from './customers/components/nueva-reserva-modal/components/dialog/dialog.component';
import { BloqueoReservaModalComponent } from './customers/components/bloqueo-customer-modal/bloqueo-reserva-modal.component';
import { LOCALE_ID } from '@angular/core';
import { registerLocaleData } from '@angular/common';
import localeEs from '@angular/common/locales/es';
import { ConfirmationModalComponent } from './customers/components/helpers/confirmation-modal/confirmation-modal/confirmation-modal.component';
import { ModificaHuespedComponent } from './customers/components/helpers/modifica-huesped/modifica-huesped.component';
import { TransaccionesComponentComponent } from './customers/components/edit-reserva-modal/components/transacciones/transacciones-component/transacciones-component.component';
import { ReservasComponentComponent } from './customers/components/edit-reserva-modal/components/reserva/reservas-component/reservas-component.component';
import { HuespedComponentComponent } from './customers/components/edit-reserva-modal/components/huesped/huesped-component/huesped-component.component';
import { EdoCuentaComponentComponent } from './customers/components/edit-reserva-modal/components/estado-de-cuenta/edo-cuenta-component/edo-cuenta-component.component';
import {MatInputModule} from '@angular/material/input';
import {LoadingSpinnerComponent} from './helpers/loader-spinner/loader-spinner.component'
import {MatRadioModule} from '@angular/material/radio';
import { AtLeastOne_ValidatorDirective } from './_directives/at-least-one.validator.directive';
import { AjustesComponent } from './customers/components/helpers/ajustes-huesped/ajustes.component';
import {MatTableModule} from '@angular/material/table';
import {MatPaginatorModule} from '@angular/material/paginator';
import { DetalleComponent } from './customers/components/edit-reserva-modal/components/transacciones/helpers/detalle/detalle.component';
import { SuperUserComponent } from './customers/helpers/authorization/super.user/super.user.component';
import { ClientesComponent } from './clientes/clientes.component';
import { SharedModule } from 'src/app/shared/shared.module';
import { SaldoCuentaComponent } from './customers/components/edit-reserva-modal/components/_helpers/saldo-cuenta/saldo-cuenta.component';
import { InlineSpinnerComponent } from './helpers/inline-spinner/inline-spinner.component';
import { VerFolioComponent } from './clientes/components/ver-folio/ver-folio.component';
import { HuespedComponent } from './clientes/components/ver-folio/components/huesped/huesped.component';
import { ReservaComponent } from './clientes/components/ver-folio/components/reserva/reserva.component';
import { TransaccionesComponent } from './clientes/components/ver-folio/components/transacciones/transacciones.component';
import { EdoCuentaComponent } from './clientes/components/ver-folio/components/edo-cuenta/edo-cuenta.component';
import { VistaClienteComponent } from './clientes/components/ver-folio/components/vista-cliente/vista-cliente.component';

// the second parameter 'fr' is optional
registerLocaleData(localeEs);

@NgModule({
  declarations: [
    ReportesComponent,
    CustomersComponent,
    ProductsComponent,
    DeleteHuespedModalComponent,
    DeleteHuespedesModalComponent,
    FetchCustomersModalComponent,
    UpdateCustomersStatusModalComponent,
    EditReservaModalComponent,
    DeleteProductModalComponent,
    DeleteProductsModalComponent,
    UpdateProductsStatusModalComponent,
    FetchProductsModalComponent,
    ProductEditComponent,
    RemarksComponent,
    SpecificationsComponent,
    DeleteRemarkModalComponent,
    DeleteRemarksModalComponent,
    FetchRemarksModalComponent,
    DeleteSpecModalComponent,
    DeleteSpecsModalComponent,
    FetchSpecsModalComponent,
    EditRemarkModalComponent,
    EditSpecModalComponent,
    MessagesComponent,
    NuevaReservaModalComponent,
    BloqueoReservaModalComponent,
    ConfirmationModalComponent,
    ModificaHuespedComponent,
    TransaccionesComponentComponent,
    ReservasComponentComponent,
    HuespedComponentComponent,
    EdoCuentaComponentComponent,
    AtLeastOne_ValidatorDirective,
    AjustesComponent,
    DetalleComponent,
    SuperUserComponent,
    ClientesComponent,
    SaldoCuentaComponent,
    InlineSpinnerComponent,
    VerFolioComponent,
    HuespedComponent,
    ReservaComponent,
    TransaccionesComponent,
    EdoCuentaComponent,
    VistaClienteComponent,
      ],
  imports: [
    MatSlideToggleModule,
    CommonModule,
    FormsModule,
    GeneralModule,
    HighlightModule,
    CRUDTableModule,
    NgbNavModule,
    NgbTooltipModule,
    CommonModule,
    HttpClientModule,
    ReportesRoutingModule,
    FormsModule,
    ReactiveFormsModule,
    InlineSVGModule,
    CRUDTableModule,
    NgbModalModule,
    NgbDatepickerModule,
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
    SharedModule,

       // RouterModule.forChild([
    //   {
    //     path: '',
    //     component: ReportesComponent,
    //   },
    // ]),
  ],

  entryComponents: [
    DeleteHuespedModalComponent,
    DeleteHuespedesModalComponent,
    UpdateCustomersStatusModalComponent,
    FetchCustomersModalComponent,
    EditReservaModalComponent,
    DeleteProductModalComponent,
    DeleteProductsModalComponent,
    UpdateProductsStatusModalComponent,
    FetchProductsModalComponent,
    DeleteRemarkModalComponent,
    DeleteRemarksModalComponent,
    FetchRemarksModalComponent,
    DeleteSpecModalComponent,
    DeleteSpecsModalComponent,
    FetchSpecsModalComponent,
    EditRemarkModalComponent,
    EditSpecModalComponent,
    DialogComponent,
    BloqueoReservaModalComponent,
    


  ],
  providers: [{ provide: LOCALE_ID, useValue: 'fr-FR' },
]
})
@Injectable({
  providedIn: 'root',
})
export class ReportesModule {}
