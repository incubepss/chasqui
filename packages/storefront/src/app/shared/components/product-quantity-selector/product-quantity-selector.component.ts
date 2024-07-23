import {
  Component,
  ChangeDetectionStrategy,
  Input,
  Output,
  EventEmitter,
  OnDestroy,
  OnChanges,
  SimpleChanges,
  ChangeDetectorRef,
  ViewChild,
  ElementRef,
} from '@angular/core';
import { Subject } from 'rxjs';
import { debounceTime, filter, take } from 'rxjs/operators';
import { ADJUST_ITEM_QUANTITY } from '../../../core/components/cart-drawer/cart-drawer.graphql';
import { DataService } from '../../../core/providers/data/data.service';
import { NotificationService } from '../../../core/providers/notification/notification.service';
import { AdjustItemQuantity, InsufficientStockError, OrderLine } from '../../../common/generated-types';
import { StateService } from '../../../core/providers/state/state.service';
import { CartManager } from './../../services/cart.manager';

const MAX_QTY = 999;

@Component({
  selector: 'vsf-product-quantity-selector',
  templateUrl: './product-quantity-selector.component.html',
  styleUrls: ['./product-quantity-selector.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProductQuantitySelectorComponent implements OnDestroy, OnChanges {
  @Input() product: OrderLine;
  @Input() size: 'large' | 'small' = 'large';

  @Output() changed = new EventEmitter<number>();

  @ViewChild('inputRef') input: ElementRef<HTMLInputElement>;

  isValidatingAmount = false;
  hasError = false;
  internalValue = 0;
  debouncer: Subject<number | string> = new Subject<number | string>();

  constructor(
    private dataService: DataService,
    private cartManager: CartManager,
    private stateService: StateService,
    private notificationService: NotificationService,
    private changeDetector: ChangeDetectorRef,
  ) {
    this.debouncer
      .pipe(
        debounceTime(500),
        filter(value => {
          if (value === 0) return true;
          return !!value;
        }),
      )
      .subscribe(debouncedValue => {
        const newValue = Number(debouncedValue);

        if (newValue > MAX_QTY) {
          this.hasError = true;
          this.notificationService.error('El valor máximo permitido es ' + MAX_QTY, '¡uy!');
          this.changeDetector.markForCheck();
          return;
        }
        this.hasError = false;
        this.changeDetector.markForCheck();

        this.adjustItemQuantity(this.product.id, Number(debouncedValue));
      });
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes.product.firstChange) {
      this.internalValue = changes.product.currentValue.quantity;
      return;
    }
    if (changes.product.currentValue.quantity !== changes.product.previousValue.quantity) {
      this.internalValue = changes.product.currentValue.quantity;
      this.isValidatingAmount = false;
      this.hasError = false;
      this.changeDetector.markForCheck();
    }
  }

  private adjustItemQuantity(id: string, qty: number) {
    this.isValidatingAmount = true;
    this.changeDetector.detectChanges();
    this.dataService
      .mutate<AdjustItemQuantity.Mutation, AdjustItemQuantity.Variables>(ADJUST_ITEM_QUANTITY, {
        id,
        qty,
      })
      .pipe(take(1))
      .subscribe(({ adjustOrderLine }) => {
        switch (adjustOrderLine.__typename) {
          case 'Order':
            break;
          case 'InsufficientStockError':
            this.notificationService.error(adjustOrderLine.message, '¡uy!');
            this.isValidatingAmount = false;
            this.internalValue = (adjustOrderLine as InsufficientStockError).quantityAvailable;
            this.input.nativeElement.value = this.internalValue.toString();
            this.changeDetector.detectChanges();
            this.refreshActiveOrder();
            break;
          case 'NegativeQuantityError':
          case 'OrderLimitError':
          case 'OrderModificationError':
            this.hasError = true;
            this.isValidatingAmount = false;
            this.changeDetector.detectChanges();
            this.notificationService.error(adjustOrderLine.message);
            break;
        }
      });
  }

  async refreshActiveOrder() {
    this.cartManager.refresh();
  }

  onInput(newValue: string) {
    if (Number(newValue) !== this.product.quantity) {
      this.debouncer.next(newValue);
    }
  }

  onAdd() {
    this.internalValue = Number(this.internalValue + 1);
    this.debouncer.next(Number(this.internalValue));
  }

  onSubstract() {
    this.internalValue = Number(this.internalValue - 1);
    this.debouncer.next(Number(this.internalValue));
  }

  restoreInternalValue(event: any) {
    if (event.target.value === '') {
      this.input.nativeElement.value = this.internalValue.toString();
    }
  }

  ngOnDestroy() {
    this.debouncer.unsubscribe();
  }
}
