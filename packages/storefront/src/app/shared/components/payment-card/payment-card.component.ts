import { Component, Input, OnInit, ChangeDetectionStrategy } from '@angular/core';

import { Payment } from '../../../common/generated-types';

@Component({
  selector: 'vsf-payment-card',
  templateUrl: './payment-card.component.html',
  styleUrls: ['./payment-card.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PaymentCardComponent implements OnInit {
  @Input() payment: Payment;
  @Input() noCard = false;

  initLink: string;

  ngOnInit() {
    if (!this.payment) {
      return;
    }

    if (this.payment.state === 'Authorized' && this.payment.metadata?.public?.init_point) {
      this.initLink = this.payment.metadata.public.init_point;
    }
  }
}
