import { Routes } from '@angular/router';
import { ShippingMethodsResolver } from './providers/shippingMethods.resolver';
import { EntregasComponent } from './components/entregas/entregas.component';

export const routes: Routes = [
  {
    path: '',
    component: EntregasComponent,
    resolve: {
      shippingMethods: ShippingMethodsResolver,
    },
  },
];
