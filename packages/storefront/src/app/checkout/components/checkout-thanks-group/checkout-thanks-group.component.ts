import { Component, OnInit, ChangeDetectionStrategy, Input } from '@angular/core';

import { GetOrderByCode } from '../../../common/generated-types';

@Component({
  selector: 'vsf-checkout-thanks-group',
  templateUrl: './checkout-thanks-group.component.html',
  styleUrls: ['./checkout-thanks-group.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CheckoutThanksGroupComponent {
  @Input()
  order: GetOrderByCode.OrderByCode;
}
