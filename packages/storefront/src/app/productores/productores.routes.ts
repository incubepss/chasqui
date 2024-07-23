import { Routes } from '@angular/router';

import { ProductoresListComponent } from './components/productores-list/productores-list.component';
import { ProductorDetailComponent } from './components/productor-detail/productor-detail.component';

export const routes: Routes = [
  {
    path: '',
    component: ProductoresListComponent,
  },
  {
    path: ':id',
    component: ProductorDetailComponent,
  },
];
