import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';

import { SharedModule, StateI18nTokenPipe, createResolveData } from '@vendure/admin-ui/core';
import { OrderDetailComponent, OrderResolver, OrderEditorComponent } from '@vendure/admin-ui/order';

import { SharedExtensionModule } from '../shared/shared-extension.module';
import { OrderGroupStateLabelComponent } from './components/orderGroup-state-label/orderGroup-state-label.component';

import { ButtonExportComponent } from './components/button-export/button-export.component';
import { OrdersFlowListComponent } from './components/ordersFlow-list/ordersFlow-list.component';
import { PaymentStateComponent } from './components/payment-state/payment-state.component';
import { RemitoTalonComponent } from './components/remito-talon/remito-talon.component';
import { CountBadgeComponent } from './components/count-badge/count-badge.component';
import { DatesFilterComponent } from './components/dates-filter/dates-filter.component';
import { OrdersFlowState } from './services/ordersFlow-state';
import { OrderGroupDetailComponent } from './components/orderGroup-detail/orderGroup-detail.component';
import { OrderGroupDetailByProductComponent } from './components/orderGroup-detail-byproduct/orderGroup-detail-byproduct.component';
import { OrderGroupDetailByCustomerComponent } from './components/orderGroup-detail-bycustomer/orderGroup-detail-bycustomer.component';
import { OrderGroupDetailAllComponent } from './components/orderGroup-detail-all/orderGroup-detail-all.component';

@NgModule({
  imports: [
    SharedModule,
    SharedExtensionModule,
    RouterModule,
    RouterModule.forChild([
      {
        path: '',
        pathMatch: 'full',
        component: OrdersFlowListComponent,
        data: {
          breadcrumb: 'Pedidos en curso',
        },
      },
      {
        path: ':id',
        component: OrderDetailComponent,
        resolve: createResolveData(OrderResolver),
        data: {
          breadcrumb: [
            {
              label: 'Pedidos en curso',
              link: ['../'],
            },
            {
              label: 'Avanzado',
              link: [''],
            },
          ],
        },
      },
      {
        path: ':id/modify',
        component: OrderEditorComponent,
        resolve: createResolveData(OrderResolver),
        data: {
          breadcrumb: [
            {
              label: 'Pedidos en curso',
              link: ['../'],
            },
            {
              label: 'Edición',
              link: [''],
            },
          ],
        },
      },
    ]),
  ],
  declarations: [
    PaymentStateComponent,
    ButtonExportComponent,
    CountBadgeComponent,
    DatesFilterComponent,
    OrderGroupDetailComponent,
    OrderGroupDetailByProductComponent,
    OrderGroupDetailByCustomerComponent,
    OrderGroupDetailAllComponent,
    OrderGroupStateLabelComponent,
    OrdersFlowListComponent,
    RemitoTalonComponent,
  ],
  providers: [StateI18nTokenPipe, TranslatePipe, OrdersFlowState],
})
export class OrdersFlowUiLazyModule {}
