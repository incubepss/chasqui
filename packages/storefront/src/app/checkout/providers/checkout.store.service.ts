import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { distinctUntilChanged, map } from 'rxjs/operators';

import { CheckoutModule } from '../checkout.module';
import { GetEligiblePaymentMethods, GetEligibleShippingMethods } from '../../common/generated-types';
import { StateService } from './../../core/providers/state/state.service';

type EligiblePaymentMethods = GetEligiblePaymentMethods.EligiblePaymentMethods;
type EligibleShippingMethods = GetEligibleShippingMethods.EligibleShippingMethods;

export interface CheckOutState {
  paymentMethod: EligiblePaymentMethods | null;
  shippingMethod: EligibleShippingMethods | null;
  shippingAddressId: string | null;
  autoCreateAccount: boolean;
}

export const initialCheckoutState: CheckOutState = {
  paymentMethod: null,
  shippingMethod: null,
  shippingAddressId: null,
  autoCreateAccount: false,
};

@Injectable({ providedIn: CheckoutModule })
export class CheckoutStoreService {
  private state: CheckOutState = initialCheckoutState;
  private readonly stateSubject = new BehaviorSubject<CheckOutState>(initialCheckoutState);

  constructor(private stateService: StateService) {
    this.stateService.select(state => state.signedIn).subscribe(this.onChangeSignedin.bind(this));
  }

  setState<T extends keyof CheckOutState>(key: T, value: CheckOutState[T]) {
    this.state[key] = value;
    this.stateSubject.next(this.state);
  }

  select<R>(selector: (state: CheckOutState) => R): Observable<R> {
    return this.stateSubject.pipe(map(selector), distinctUntilChanged());
  }

  selectCurrent<T extends keyof CheckOutState>(key: T): CheckOutState[T] {
    return this.state[key];
  }

  clear() {
    this.state.paymentMethod = null;
    this.state.shippingMethod = null;
    this.state.shippingAddressId = null;
    this.stateSubject.next(this.state);
  }

  onChangeSignedin(signedIn: boolean | undefined) {
    if (signedIn === false) {
      this.clear();
    }
  }
}
