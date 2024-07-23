import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';

import { SharedModule } from '../shared/shared.module';
import { ActiveOrderGroupsResolver } from './providers/activeOrderGroups-resolver';
import { CheckoutThanksSingleComponent } from './components/checkout-thanks-single/checkout-thanks-single.component';
import { CheckoutThanksGroupComponent } from './components/checkout-thanks-group/checkout-thanks-group.component';
import { CheckoutOrdergroupComponent } from './components/checkout-ordergroup/checkout-ordergroup.component';
import { CheckoutOrderGroupService } from './providers/checkout.orderGroup.service';
import { CheckoutResolver } from './providers/checkout-resolver';
import { CheckoutMercadopagoCallbackComponent } from './components/checkout-mercadopago-callback/checkout-mercadopago-callback.component';

import { routes } from './checkout.routes';
import { CheckoutConfirmationComponent } from './components/checkout-confirmation/checkout-confirmation.component';
import { CheckoutGuestComponent } from './components/checkout-guest/checkout-guest.component';
import { CheckoutPaymentComponent } from './components/checkout-payment/checkout-payment.component';
import { CheckoutMercadopagoComponent } from './components/checkout-mercadopago/checkout-mercadopago.component';
import { CheckoutProcessComponent } from './components/checkout-process/checkout-process.component';
import { CheckoutShippingComponent } from './components/checkout-shipping/checkout-shipping.component';
import { CheckoutSignInComponent } from './components/checkout-sign-in/checkout-sign-in.component';
import { CheckoutStageIndicatorComponent } from './components/checkout-stage-indicator/checkout-stage-indicator.component';
import { CheckoutSurchargeComponent } from './components/checkout-surcharge/checkout-surcharge.component';
import { CheckoutThanksComponent } from './components/checkout-thanks/checkout-thanks.component';
import { CheckoutStoreService } from './providers/checkout.store.service';
import { SurchargesResolver } from './providers/surcharges-resolver';
import { CheckoutOrdergroupJoinComponent } from './components/checkout-ordergroup-join/checkout-ordergroup-join.component';
import { CheckoutOrdergroupJoinToMyComponent } from './components/checkout-ordergroup-join-to-my/checkout-ordergroup-join-to-my.component';
import { CheckoutOnestepGroupComponent } from './components/checkout-onestep-group/checkout-onestep-group.component';

const DECLARATIONS = [
  CheckoutConfirmationComponent,
  CheckoutGuestComponent,
  CheckoutMercadopagoCallbackComponent,
  CheckoutPaymentComponent,
  CheckoutMercadopagoComponent,
  CheckoutShippingComponent,
  CheckoutSignInComponent,
  CheckoutProcessComponent,
  CheckoutStageIndicatorComponent,
  CheckoutSurchargeComponent,
  CheckoutThanksComponent,
  CheckoutThanksSingleComponent,
  CheckoutThanksGroupComponent,
  CheckoutOrdergroupComponent,
  CheckoutOrdergroupJoinComponent,
  CheckoutOrdergroupJoinToMyComponent,
  CheckoutOnestepGroupComponent,
];

@NgModule({
  declarations: DECLARATIONS,
  providers: [CheckoutStoreService, CheckoutOrderGroupService, SurchargesResolver, ActiveOrderGroupsResolver],
  imports: [SharedModule, RouterModule.forChild(routes)],
})
export class CheckoutModule {}
