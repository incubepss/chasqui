import {
  Component,
  ChangeDetectionStrategy,
  Input,
  OnChanges,
  SimpleChanges,
  ChangeDetectorRef,
} from '@angular/core';
import { ShippingMethodQuote } from '../../../common/generated-types';

@Component({
  selector: 'vsf-shipping-method-card-selector',
  templateUrl: './shipping-method-card-selector.component.html',
  styleUrls: ['./shipping-method-card-selector.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ShippingMethodCardSelectorComponent implements OnChanges {
  @Input() method: ShippingMethodQuote;
  @Input() selected = false;
  @Input() showPrice = true;

  @Input()
  noCard = false;

  constructor(private changeDetector: ChangeDetectorRef) {}

  ngOnChanges(changes: SimpleChanges) {
    this.changeDetector.markForCheck();
  }

  getClass(): string {
    const classes = ['shippingMethodContainer'];

    if (this.method?.customFields?.typeDelivery) {
      classes.push('--' + this.method.customFields?.typeDelivery);
    }

    if (this.selected === true) {
      classes.push('--selected');
    }

    return classes.join(' ');
  }
}
