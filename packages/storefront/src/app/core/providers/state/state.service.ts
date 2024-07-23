import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { distinctUntilChanged, map } from 'rxjs/operators';

import { Channel, PaymentMethod, GetActiveCustomer } from '../../../common/generated-types';

export interface SelloMenu {
  id: string | number;
  code: string;
  name: string;
}

export interface AppState {
  signedIn: boolean;
  activeOrderId: string | null;
  lastCollectionSlug: string | null;
  mobileNavMenuIsOpen: boolean;
  mobileCateMenuIsOpen: boolean;
  cartDrawerOpen: boolean;
  activeChannel: Channel | null;
  activeChannelName: string;
  activeCustomer: GetActiveCustomer.ActiveCustomer | null;
  sellosMenu: SelloMenu[];
  paymentMethods: PaymentMethod[];
  storeDisabled: boolean;
  orderGroupEnabled: boolean;
  orderSinglesEnabled: boolean;
}

export const initialState: AppState = {
  signedIn: false,
  activeOrderId: null,
  cartDrawerOpen: false,
  lastCollectionSlug: null,
  mobileNavMenuIsOpen: false,
  mobileCateMenuIsOpen: false,
  activeChannel: null,
  activeChannelName: '',
  activeCustomer: null,
  sellosMenu: [],
  paymentMethods: [],
  storeDisabled: false,
  orderGroupEnabled: false,
  orderSinglesEnabled: true,
};

/**
 * A simple, observable store of global app state.
 */
@Injectable({
  providedIn: 'root',
})
export class StateService {
  private state: AppState = initialState;
  private readonly stateSubject = new BehaviorSubject<AppState>(initialState);

  constructor() {
    if (typeof window !== 'undefined') {
      Object.defineProperty(window, 'appState', {
        get: () => this.stateSubject.value,
      });
    }
  }

  setState<T extends keyof AppState>(key: T, value: AppState[T]) {
    if (key === 'mobileCateMenuIsOpen' && value && this.state.mobileNavMenuIsOpen) {
      this.state.mobileNavMenuIsOpen = false;
    }
    if (key === 'mobileNavMenuIsOpen' && value && this.state.mobileCateMenuIsOpen) {
      this.state.mobileCateMenuIsOpen = false;
    }

    if (key === 'activeChannel') {
      const activeChannel = value as Channel;
      const channelName = activeChannel?.customFields?.nombre || activeChannel?.code || '';
      this.state['activeChannelName'] = channelName;
      this.state['storeDisabled'] = activeChannel?.customFields?.storeEnabled !== true;
      this.state['orderGroupEnabled'] = activeChannel?.customFields?.orderGroupEnabled === true;
      this.state['orderSinglesEnabled'] = activeChannel?.customFields?.orderSinglesEnabled === true;
    }

    if (key === 'activeCustomer') {
      const activeCustomer = value as GetActiveCustomer.ActiveCustomer;
      this.state['activeCustomer'] = activeCustomer;
      this.state['signedIn'] = !!activeCustomer;
    }

    if (key === 'signedIn' && !value) {
      this.state['activeCustomer'] = null;
      this.state['activeOrderId'] = null;
    }

    this.state[key] = value;
    this.stateSubject.next(this.state);
  }

  select<R>(selector: (state: AppState) => R): Observable<R> {
    return this.stateSubject.pipe(map(selector), distinctUntilChanged());
  }

  selectCurrentValue<T extends keyof AppState>(key: T): AppState[T] {
    return this.state[key];
  }

  getPaymentMethodByCode(code: string): PaymentMethod | undefined {
    return this.state['paymentMethods']?.find(pm => pm.code === code);
  }

  isMercadoPagoPayment(code: string): boolean {
    const paymentMethod = this.getPaymentMethodByCode(code);
    return paymentMethod?.handler?.code === 'payment-mercado-pago' || false;
  }
}
