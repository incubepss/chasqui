import { ChangeDetectionStrategy, Component } from '@angular/core';
import { Observable } from 'rxjs';

import { CheckoutStoreService } from '../../providers/checkout.store.service';

@Component({
  selector: 'vsf-checkout-sign-in',
  templateUrl: './checkout-sign-in.component.html',
  styleUrls: ['./checkout-sign-in.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CheckoutSignInComponent {
  mode: 'sign-in' | 'guest-form' = 'sign-in';

  isEnabledAutoCreateAccount$: Observable<boolean>;

  constructor(private checkoutStoreService: CheckoutStoreService) {
    this.isEnabledAutoCreateAccount$ = checkoutStoreService.select(s => s.autoCreateAccount);
  }

  createNewAccount() {
    this.checkoutStoreService.setState('autoCreateAccount', true);
    this.mode = 'guest-form';
  }

  continueAsGuest() {
    this.checkoutStoreService.setState('autoCreateAccount', false);
    this.mode = 'guest-form';
  }
}
