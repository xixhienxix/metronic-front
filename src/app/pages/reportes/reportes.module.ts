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
import { EditReservaModalComponent } from './customers/components/edit-reserva-modal/edit-reserva-modal/edit-reserva-modal.component'
import { MatSlideToggleModule} from '@angular/material/slide-toggle';
import { MatTabsModule} from '@angular/material/tabs';
import { MatCheckboxModule } from '@angular/material/checkbox';
import {MatExpansionModule} from '@angular/material/expansion';
import {MatIconModule} from '@angular/material/icon';
import {MatDatepickerModule} from '@angular/material/datepicker';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatButtonModule} from '@angular/material/button';


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
    EditSpecModalComponent
  ]
})
@Injectable({
  providedIn: 'root'
})
export class ReportesModule {}
