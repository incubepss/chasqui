import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Observable } from 'rxjs';
import { map, switchMap, take } from 'rxjs/operators';

import {
  AddPayment,
  GetEligiblePaymentMethods,
  GetOrderForCheckout,
  TransitionToArrangingPayment,
} from '../../../common/generated-types';

import { DataService } from '../../../core/providers/data/data.service';
import { StateService } from '../../../core/providers/state/state.service';
import { NotificationService } from '../../../core/providers/notification/notification.service';
import { CartManager } from '../../../shared/services/cart.manager';

import { CheckoutStoreService } from '../../providers/checkout.store.service';
import { TRANSITION_TO_ARRANGING_PAYMENT } from '../checkout-shipping/checkout-shipping.graphql';
import { ADD_PAYMENT } from '../checkout-payment/checkout-payment.graphql';
import { GET_ELIGIBLE_PAYMENT_METHODS } from './checkout-onestep-group.graphql';

@Component({
  selector: 'vsf-checkout-onestep-group',
  templateUrl: './checkout-onestep-group.component.html',
  styleUrls: ['./checkout-onestep-group.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CheckoutOnestepGroupComponent implements OnInit {
  paymentMethod: any;
  paymentErrorMessage = '';
  cart$: Observable<GetOrderForCheckout.ActiveOrder | null | undefined>;
  busy = false;
  comments = '';

  signedIn$: Observable<boolean>;
  orderGroupEnabled$: Observable<boolean>;

  constructor(
    private stateService: StateService,
    private cartManager: CartManager,
    private dataService: DataService,
    private changeDetector: ChangeDetectorRef,
    private route: ActivatedRoute,
    private router: Router,
    private checkoutService: CheckoutStoreService,
    private notificationService: NotificationService,
  ) {}

  async ngOnInit() {
    this.cart$ = this.route.data.pipe(
      switchMap(data => data.activeOrder as Observable<GetOrderForCheckout.ActiveOrder>),
    );
    this.signedIn$ = this.stateService.select(state => state.signedIn);
    this.orderGroupEnabled$ = this.cartManager.orderGroupsAllowed$;

    this.selectFirstManualPaymentMethod();
  }

  async selectFirstManualPaymentMethod() {
    this.busy = true;
    this.changeDetector.markForCheck();

    try {
      const paymentMethods = await this.dataService
        .query<GetEligiblePaymentMethods.Query>(GET_ELIGIBLE_PAYMENT_METHODS)
        .pipe(
          take(1),
          map(res => res.eligiblePaymentMethods),
        )
        .toPromise();

      this.paymentMethod = paymentMethods?.find(method => method.isEligible);
    } finally {
      this.busy = false;
      this.changeDetector.markForCheck();
    }
  }

  async completeOrder() {
    const paymentMethodCode: string = this.paymentMethod?.code;

    if (!paymentMethodCode) {
      this.paymentErrorMessage = 'No se conoce el metodo de pago';
      this.notificationService.error(this.paymentErrorMessage);
      return;
    }

    this.busy = true;
    this.changeDetector.markForCheck();

    const defaultMsgError = 'uy! No se pudo cambiar el estado del pedido';

    try {
      const responseToPayment = await this.dataService
        .mutate<TransitionToArrangingPayment.Mutation>(TRANSITION_TO_ARRANGING_PAYMENT)
        .toPromise()
        .then(r => r.transitionOrderToState);

      if (responseToPayment?.__typename === 'OrderStateTransitionError') {
        this.notificationService.error(defaultMsgError);
        this.busy = false;
        this.changeDetector.markForCheck();
        return;
      }
    } catch (e) {
      this.notificationService.error(defaultMsgError);
      this.busy = false;
      this.changeDetector.markForCheck();
      return;
    }

    this.dataService
      .mutate<AddPayment.Mutation, AddPayment.Variables>(ADD_PAYMENT, {
        input: {
          method: paymentMethodCode,
          metadata: { comments: this.comments },
        },
      })
      .subscribe(async ({ addPaymentToOrder }) => {
        switch (addPaymentToOrder?.__typename) {
          case 'Order':
            const order = addPaymentToOrder;
            if (order && (order.state === 'PaymentSettled' || order.state === 'PaymentAuthorized')) {
              if (this.stateService.isMercadoPagoPayment(paymentMethodCode)) {
                this.router.navigate(['/finalizar-compra/mercadopago', order.code]);
              } else {
                this.router.navigate(['/finalizar-compra/gracias', order.code]);
              }

              await new Promise<void>(resolve =>
                setTimeout(() => {
                  this.cartManager.clear();
                  resolve();
                }, 500),
              );

              this.checkoutService.clear();
            }
            break;
          case 'OrderPaymentStateError':
          case 'PaymentDeclinedError':
          case 'PaymentFailedError':
          case 'OrderStateTransitionError':
            this.paymentErrorMessage = addPaymentToOrder.message;
            this.notificationService.error(this.paymentErrorMessage);
            break;
        }

        this.busy = false;
        this.changeDetector.markForCheck();
      });
  }
}
