import { NgModule } from '@angular/core';

import { SharedModule } from '../shared/shared.module';
import { CoreModule } from './../core/core.module';
import { ProductoresListComponent } from './components/productores-list/productores-list.component';
import { ProductorDetailComponent } from './components/productor-detail/productor-detail.component';
import { ProductorCardComponent } from './components/productor-card/productor-card.component';
import { ProductorProductListComponent } from './components/productor-product-list/productor-product-list.component';

// This is for lazy mode:
// import { RouterModule } from '@angular/router';
// import { routes } from './productores.routes';

@NgModule({
  imports: [SharedModule, CoreModule],
  declarations: [
    ProductorDetailComponent,
    ProductoresListComponent,
    ProductorCardComponent,
    ProductorProductListComponent,
  ],
})
export class ProductoresModule {}
