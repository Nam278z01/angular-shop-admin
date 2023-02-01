
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
import { EchartsModule } from 'src/app/@shared/components/echarts/echarts.module';

import { DashboardRoutingModule } from './dashboard-routing.module';
import { DashboardComponent } from './dashboard.component';
@NgModule({
  declarations: [
    DashboardComponent,
  ],
  imports: [
    SharedModule,
    FormsModule,
    PaginationModule,
    InputNumberModule,
    DatepickerModule,
    TooltipModule,
    ToastModule,
    EchartsModule,
    DashboardRoutingModule
  ],
})
export class DashboardModule {}
