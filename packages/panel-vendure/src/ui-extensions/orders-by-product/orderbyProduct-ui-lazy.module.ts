import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { SharedModule } from '@vendure/admin-ui/core';

import { SharedExtensionModule } from '../shared/shared-extension.module';

import { OrderbyProductListComponent } from './components/orderby-product-list/orderby-product-list.component';

@NgModule({
  imports: [
    SharedModule,
    SharedExtensionModule,
    RouterModule,
    RouterModule.forChild([
      {
        path: '',
        pathMatch: 'full',
        component: OrderbyProductListComponent,
        data: {
          breadcrumb: 'Artículos en curso',
        },
      },
    ]),
  ],
  declarations: [OrderbyProductListComponent],
})
export class OrderbyProductUiLazyModule {}
