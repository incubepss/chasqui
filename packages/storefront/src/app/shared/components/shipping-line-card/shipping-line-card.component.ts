import { ChangeDetectionStrategy, Component, Input } from '@angular/core';

import { ShippingLine } from '../../../common/generated-types';

@Component({
  selector: 'vsf-shipping-line-card',
  templateUrl: './shipping-line-card.component.html',
  styleUrls: ['./shipping-line-card.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ShippingLineCardComponent {
  @Input() shippingLine: ShippingLine;
  @Input() title = '';
  @Input() noCard = false;
}
