import {
  Component,
  ChangeDetectorRef,
  ChangeDetectionStrategy,
  Output,
  EventEmitter,
  Input,
} from '@angular/core';
import { Router } from '@angular/router';
import { map, tap } from 'rxjs/operators';

import { DataService } from '../../../core/providers/data/data.service';
import { NotificationService } from '../../../core/providers/notification/notification.service';
import { SetCustomerForOrder } from '../../../common/generated-types';

import { SET_CUSTOMER_FOR_ORDER } from './checkout-guest.graphql';

@Component({
  selector: 'vsf-checkout-guest',
  templateUrl: './checkout-guest.component.html',
  styleUrls: ['./checkout-guest.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CheckoutGuestComponent {
  @Input()
  showLastName = true;

  @Output() back = new EventEmitter<string>();
  firstName = '';
  lastName = '';
  emailAddress = '';
  emailAlreadyInUse = false;
  phoneNumber = '';

  constructor(
    private dataService: DataService,
    private changeDetector: ChangeDetectorRef,
    private notificationService: NotificationService,
    private router: Router,
  ) {
    this.firstName = this.getLastAlias();
  }

  onBack() {
    this.back.emit(this.emailAddress);
  }

  getLastAlias(): string {
    return window.localStorage.getItem('lastAlias') || '';
  }

  setCustomerForOrder() {
    if (this.emailAddress) {
      this.emailAlreadyInUse = false;
      return this.dataService
        .mutate<SetCustomerForOrder.Mutation, SetCustomerForOrder.Variables>(SET_CUSTOMER_FOR_ORDER, {
          input: {
            emailAddress: this.emailAddress,
            firstName: this.firstName,
            lastName: this.lastName,
            phoneNumber: this.phoneNumber,
          },
        })
        .pipe(
          tap(({ setCustomerForOrder }) => {
            if (
              setCustomerForOrder &&
              setCustomerForOrder.__typename !== 'Order' &&
              setCustomerForOrder.__typename !== 'EmailAddressConflictError'
            ) {
              this.notificationService.error((setCustomerForOrder as any).message);
            }
          }),
          map(response => response.setCustomerForOrder),
        )
        .subscribe(response => {
          if (response.__typename === 'EmailAddressConflictError') {
            this.emailAlreadyInUse = true;
            this.changeDetector.markForCheck();
            return;
          }

          if (response?.__typename === 'Order') {
            this.router.navigate(['/finalizar-compra', 'entrega']);
          }
        });
    }
  }

  tryAgain() {
    this.emailAlreadyInUse = false;
    this.changeDetector.markForCheck();
  }
}
