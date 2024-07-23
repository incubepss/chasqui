import { TemplateAst } from '@angular/compiler';
import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output, TemplateRef } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { environment } from '../../../../../src/environments/environment';

import { Cart, CartFragment, GetActiveOrder } from '../../../common/generated-types';

@Component({
  selector: 'vsf-cart-contents',
  templateUrl: './cart-contents.component.html',
  styleUrls: ['./cart-contents.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CartContentsComponent {
  @Input() cart: GetActiveOrder.ActiveOrder;
  @Input() canAdjustQuantities = false;
  @Output() setQuantity = new EventEmitter<{ itemId: string; quantity: number }>();
  environment: any = environment;

  constructor(private modalService: NgbModal) {}

  increment(item: Cart.Lines) {
    this.setQuantity.emit({ itemId: item.id, quantity: item.quantity + 1 });
  }

  decrement(item: Cart.Lines) {
    this.setQuantity.emit({ itemId: item.id, quantity: item.quantity - 1 });
  }

  trackByFn(index: number, line: { id: string }) {
    return line.id;
  }

  remove(template: TemplateRef<any>, item: Cart.Lines) {
    this.modalService.open(template).result.then(() => {
      this.setQuantity.emit({ itemId: item.id, quantity: 0 });
    });
  }

  trackByDiscount(index: number, discount: Cart.Discounts) {
    return discount.adjustmentSource;
  }

  isDiscounted(line: CartFragment['lines'][number]): boolean {
    return line.discountedLinePriceWithTax < line.linePriceWithTax;
  }

  get hasDiscountPromotions(): boolean {
    return this.cart.discounts?.some(d => d.type !== 'OTHER') || false;
  }

  get discountPromotions() {
    return this.cart.discounts?.filter(d => d.type !== 'OTHER') || [];
  }

  /**
   * Filters out the Promotion adjustments for an OrderLine and aggregates the discount.
   */
  getLinePromotions(adjustments: Cart.Discounts[]) {
    const groupedPromotions = adjustments
      .filter(a => a.type === 'PROMOTION')
      .reduce((groups, promotion) => {
        if (!groups[promotion.description]) {
          groups[promotion.description] = promotion.amount;
        } else {
          groups[promotion.description] += promotion.amount;
        }
        return groups;
      }, {} as { [description: string]: number });
    return Object.entries(groupedPromotions).map(([key, value]) => ({ description: key, amount: value }));
  }
}
