import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { SharedModule } from 'src/app/@shared/shared.module';
import {
  DatepickerModule,
  InputNumberModule,
  PaginationModule,
  TooltipModule,
  ToastModule
} from 'ng-devui';
import { CKEditorModule } from '@ckeditor/ckeditor5-angular';
import { NgxDropzoneModule } from 'ngx-dropzone';

import { ManagementComponent } from './management.component';
import { ManagementRoutingModule } from './management-routing.module';
import { AdminFormModule } from 'src/app/@shared/components/admin-form/admin-form.module';
import { ProductComponent } from './product/product.component';
import { OrderComponent } from './order/order.component';

@NgModule({
  declarations: [
    ManagementComponent,
    ProductComponent,
    OrderComponent,
  ],
  imports: [
    SharedModule,
    FormsModule,
    PaginationModule,
    AdminFormModule,
    InputNumberModule,
    DatepickerModule,
    TooltipModule,
    ToastModule,
    CKEditorModule,
    NgxDropzoneModule,
    ManagementRoutingModule
  ],
})
export class ManagementModule {}
