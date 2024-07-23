import { Component, ChangeDetectionStrategy, Input, Output, EventEmitter } from '@angular/core';
import { Payment } from '@vendure/core';

@Component({
  selector: 'chq-payment-state',
  templateUrl: './payment-state.component.html',
  styleUrls: ['./payment-state.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PaymentStateComponent {
  @Input() payment: Payment;
  @Input() printMode: boolean;
  @Output() onToSettled = new EventEmitter<Payment>(false);

  get chipColorType() {
    switch (this.payment?.state) {
      case 'Authorized':
        return 'warning';
      case 'Settled':
        return 'success';
      case 'Declined':
      case 'Cancelled':
        return 'error';
    }
  }

  transitionToSettled() {
    this.onToSettled.emit(this.payment);
  }
}
