import { RouterModule, Routes } from '@angular/router';
import { NgModule } from '@angular/core';

import { ManagementComponent } from './management.component';
import { ProductComponent } from './product/product.component';
import { OrderComponent } from './order/order.component';

const routes: Routes = [
  {
    path: '',
    component: ManagementComponent,
    children: [
      { path: 'product', component: ProductComponent },
      { path: 'order', component: OrderComponent },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ManagementRoutingModule {}
