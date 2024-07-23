import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, Router } from '@angular/router';
import { combineLatest, Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { GetOrderForCheckout } from '../../common/generated-types';
import { DataService } from '../../core/providers/data/data.service';
import { StateService } from '../../core/providers/state/state.service';
import { CheckoutConfirmationComponent } from '../components/checkout-confirmation/checkout-confirmation.component';
import { CheckoutOnestepGroupComponent } from '../components/checkout-onestep-group/checkout-onestep-group.component';
import { CheckoutPaymentComponent } from '../components/checkout-payment/checkout-payment.component';
import { CheckoutShippingComponent } from '../components/checkout-shipping/checkout-shipping.component';
import { CheckoutSignInComponent } from '../components/checkout-sign-in/checkout-sign-in.component';
import { CheckoutMercadopagoCallbackComponent } from './../components/checkout-mercadopago-callback/checkout-mercadopago-callback.component';
import { CheckoutThanksComponent } from './../components/checkout-thanks/checkout-thanks.component';

import { GET_ORDER_FOR_CHECKOUT } from './checkout-resolver.graphql';

@Injectable({ providedIn: 'root' })
export class CheckoutGuard implements CanActivate {
  constructor(private router: Router, private dataService: DataService, private stateService: StateService) {}

  canActivate(route: ActivatedRouteSnapshot): Observable<boolean> {
    const activeOrder$ = this.dataService
      .query<GetOrderForCheckout.Query>(GET_ORDER_FOR_CHECKOUT, undefined, 'cache-first')
      .pipe(map(data => data.activeOrder));

    const orderState$ = activeOrder$.pipe(map(order => order?.state || ''));

    const signedIn$ = this.stateService.select(state => state.signedIn);

    return combineLatest([activeOrder$, orderState$, signedIn$]).pipe(
      map(([order, orderState, signedIn]) => {
        const component = route.component;

        const isOnGroup =
          //@ts-ignore
          order?.customFields?.orderGroup?.id && !order.customFields?.isOrderHeadOfGroup;

        if (component === CheckoutSignInComponent) {
          if (signedIn) {
            if (isOnGroup) {
              this.router.navigate(['/finalizar-compra', 'grupos']);
            } else {
              this.router.navigate(['/finalizar-compra', 'entrega']);
            }
            return false;
          } else {
            if (orderState === 'AddingItems') {
              return true;
            } else if (orderState === 'ArrangingPayment') {
              this.router.navigate(['/finalizar-compra', 'pago']);
              return false;
            } else {
              return false;
            }
          }
        } else if (component === CheckoutShippingComponent) {
          if (isOnGroup) {
            this.router.navigate(['/finalizar-compra', 'grupos']);
            return false;
          }
          if (orderState === 'AddingItems') {
            return true;
          } else if (orderState === 'ArrangingPayment') {
            this.router.navigate(['/finalizar-compra', 'pago']);
            return false;
          } else {
            return false;
          }
        } else if (
          component === CheckoutPaymentComponent ||
          component === CheckoutConfirmationComponent ||
          component === CheckoutThanksComponent ||
          component === CheckoutMercadopagoCallbackComponent ||
          component === CheckoutOnestepGroupComponent
        ) {
          return true;
        }

        return true;
      }),
    );
  }
}
