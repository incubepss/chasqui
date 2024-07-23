import { Routes } from '@angular/router';

import { CheckoutOnestepGroupComponent } from './components/checkout-onestep-group/checkout-onestep-group.component';
import { CheckoutConfirmationComponent } from './components/checkout-confirmation/checkout-confirmation.component';
import { CheckoutThanksComponent } from './components/checkout-thanks/checkout-thanks.component';
import { CheckoutPaymentComponent } from './components/checkout-payment/checkout-payment.component';
import { CheckoutMercadopagoComponent } from './components/checkout-mercadopago/checkout-mercadopago.component';
import { CheckoutProcessComponent } from './components/checkout-process/checkout-process.component';
import { CheckoutShippingComponent } from './components/checkout-shipping/checkout-shipping.component';
import { CheckoutSignInComponent } from './components/checkout-sign-in/checkout-sign-in.component';
import { CheckoutResolver } from './providers/checkout-resolver';
import { CheckoutGuard } from './providers/checkout.guard';
import { SurchargesResolver } from './providers/surcharges-resolver';
import { CheckoutMercadopagoCallbackComponent } from './components/checkout-mercadopago-callback/checkout-mercadopago-callback.component';
import { ActiveOrderGroupsResolver } from './providers/activeOrderGroups-resolver';

export const routes: Routes = [
  {
    path: '',
    component: CheckoutProcessComponent,
    resolve: {
      activeOrder: CheckoutResolver,
    },
    children: [
      {
        path: '',
        pathMatch: 'full',
        component: CheckoutSignInComponent,
        canActivate: [CheckoutGuard],
      },
      {
        path: 'grupos',
        component: CheckoutOnestepGroupComponent,
        canActivate: [CheckoutGuard],
        resolve: {
          activeOrder: CheckoutResolver,
          activeOrderGroups: ActiveOrderGroupsResolver,
        },
      },
      {
        path: 'entrega',
        component: CheckoutShippingComponent,
        canActivate: [CheckoutGuard],
        resolve: {
          activeOrder: CheckoutResolver,
          activeOrderGroups: ActiveOrderGroupsResolver,
        },
      },
      {
        path: 'pago',
        component: CheckoutPaymentComponent,
        canActivate: [CheckoutGuard],
        resolve: {
          activeOrder: CheckoutResolver,
          surcharges: SurchargesResolver,
        },
      },
      {
        path: 'confirmar',
        component: CheckoutConfirmationComponent,
        canActivate: [CheckoutGuard],
        resolve: {
          activeOrder: CheckoutResolver,
        },
      },
      {
        path: 'mercadopago/:code',
        canActivate: [CheckoutGuard],
        component: CheckoutMercadopagoComponent,
      },
      {
        path: 'mercadopago-gracias',
        canActivate: [CheckoutGuard],
        component: CheckoutMercadopagoCallbackComponent,
      },
      {
        path: 'gracias/:code',
        component: CheckoutThanksComponent,
        canActivate: [CheckoutGuard],
      },
    ],
  },
];
