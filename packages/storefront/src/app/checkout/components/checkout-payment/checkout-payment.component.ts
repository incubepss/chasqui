import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { BehaviorSubject, Observable } from 'rxjs';
import { first, map, take } from 'rxjs/operators';

import { AddPayment, GetEligiblePaymentMethods } from '../../../common/generated-types';
import { DataService } from '../../../core/providers/data/data.service';
import { StateService } from '../../../core/providers/state/state.service';
import { CheckoutStoreService } from '../../providers/checkout.store.service';

import { ADD_PAYMENT, GET_ELIGIBLE_PAYMENT_METHODS } from './checkout-payment.graphql';

@Component({
  selector: 'vsf-checkout-payment',
  templateUrl: './checkout-payment.component.html',
  styleUrls: ['./checkout-payment.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CheckoutPaymentComponent implements OnInit {
  comments: string;
  paymentMethods$: Observable<GetEligiblePaymentMethods.EligiblePaymentMethods[]>;
  paymentErrorMessage: string | undefined;
  stepPayment: 'selectPayment' | 'selectSurcharge' = 'selectPayment';
  selectedPaymentMethod: GetEligiblePaymentMethods.EligiblePaymentMethods;

  surcharges$: Observable<any[]>;

  canContinue$ = new BehaviorSubject(false);

  constructor(
    private dataService: DataService,
    private stateService: StateService,
    private router: Router,
    private route: ActivatedRoute,
    private checkoutStore: CheckoutStoreService,
  ) {}

  ngOnInit() {
    this.paymentMethods$ = this.dataService
      .query<GetEligiblePaymentMethods.Query>(GET_ELIGIBLE_PAYMENT_METHODS)
      .pipe(map(res => res.eligiblePaymentMethods));

    this.surcharges$ = this.route.data.pipe(map(data => data.surcharges));

    const currentPaymentMethod = this.checkoutStore.selectCurrent('paymentMethod');

    if (currentPaymentMethod) {
      this.selectedPaymentMethod = currentPaymentMethod;
      this.stepPayment = 'selectSurcharge';
      this.canContinue$.next(true);
    }

    this.paymentMethods$.pipe(first()).subscribe(methods => {
      if (methods.length === 1) {
        this.selectMethodCode(methods[0]);
      }
    });
  }

  async areThereSurcharges(): Promise<boolean> {
    const surcharges = await this.surcharges$.pipe(take(1)).toPromise();
    return surcharges?.length > 0 || false;
  }

  async selectMethodCode(paymentMethod: GetEligiblePaymentMethods.EligiblePaymentMethods) {
    this.selectedPaymentMethod = paymentMethod;
    this.checkoutStore.setState('paymentMethod', paymentMethod);
    this.stepPayment = 'selectSurcharge';

    setTimeout(() => {
      const elList = document.querySelectorAll('.card-adicionales');
      const el = elList?.[0] as HTMLElement;
      el?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    });

    this.canContinue$.next(true);
  }

  selectPayment(): void {
    this.stepPayment = 'selectPayment';
  }

  goToConfirm(): void {
    this.router.navigate(['/finalizar-compra/confirmar'], {
      state: { paymentMethod: this.selectedPaymentMethod },
    });
  }
}
