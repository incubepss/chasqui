import { timeStamp } from 'console';
import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  HostBinding,
  HostListener,
  Input,
  OnChanges,
  OnInit,
  Output,
  SimpleChanges,
  ɵɵsyntheticHostListener,
} from '@angular/core';
import { from, Observable } from 'rxjs';
import { map, take, concatMap } from 'rxjs/operators';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';

import { Router } from '@angular/router';
import {
  AdjustItemQuantity,
  GetActiveOrder,
  OrderGroup,
  RemoveItemFromCart,
} from '../../../common/generated-types';
import { DataService } from '../../providers/data/data.service';
import { NotificationService } from '../../providers/notification/notification.service';
import { StateService } from '../../providers/state/state.service';
import { CartManager } from './../../../shared/services/cart.manager';

import {
  ADJUST_ITEM_QUANTITY,
  REMOVE_ALL_ITEM_FROM_CART,
  REMOVE_ITEM_FROM_CART,
  REMOVE_COUPON_CODE,
} from './cart-drawer.graphql';

@Component({
  selector: 'vsf-cart-drawer',
  templateUrl: './cart-drawer.component.html',
  styleUrls: ['./cart-drawer.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CartDrawerComponent implements OnInit, OnChanges {
  @HostBinding('class.visible')
  @Input()
  visible = false;
  // eslint-disable-next-line @angular-eslint/no-output-native
  @Output() close = new EventEmitter<void>();

  cart$: Observable<GetActiveOrder.ActiveOrder | null | undefined>;
  isEmpty$: Observable<boolean>;
  isStoredDisabled$: Observable<boolean>;

  orderGroup$: Observable<OrderGroup | null>;
  hasDiscounts$: Observable<boolean>;

  constructor(
    private router: Router,
    private dataService: DataService,
    private stateService: StateService,
    private cartManager: CartManager,
    private notificationService: NotificationService,
    private modalService: NgbModal,
  ) {}

  ngOnInit() {
    this.cart$ = this.cartManager.cart$;
    this.isEmpty$ = this.cart$.pipe(map(cart => !cart || cart.lines.length === 0));
    this.isStoredDisabled$ = this.stateService.select(state => state.storeDisabled);

    this.orderGroup$ = this.cart$.pipe(
      // @ts-ignore
      map(cart => cart?.customFields?.orderGroup || null),
    );

    this.hasDiscounts$ = this.cart$.pipe(
      map(cart => (cart?.discounts && cart.discounts.length > 0) || false),
    );
  }

  ngOnChanges(changes: SimpleChanges) {
    if ('visible' in changes) {
      this.makePointStateHistory();
    }
  }

  doClose(cancelForwardNav = false) {
    this.close.emit();
    this.clearPointStateHistory(cancelForwardNav);
  }

  dismiss() {
    this.close.emit();
    this.clearPointStateHistory(true);
  }

  protected makePointStateHistory() {
    if (this.visible && !window.history?.state?.sliderCart) {
      const modalState = {
        sliderCart: true,
        desc: 'Fake state for the slider cart',
      };
      history.pushState(modalState, 'slideCartOpened');
    }
  }

  protected clearPointStateHistory(cancelForwardNav = false) {
    if (cancelForwardNav && window.history?.state?.sliderCart) {
      history.back();
    }
  }

  clearCart(content: any, couponCodes: string[]) {
    this.modalService.open(content, { centered: true }).result.then(
      result => {
        this.removeAllItems(couponCodes);
      },
      // eslint-disable-next-line @typescript-eslint/no-empty-function
      () => {},
    );
  }

  confirmOrder() {
    this.doClose(false);
    this.router.navigate(['/finalizar-compra'], { replaceUrl: true });
  }

  setQuantity(event: { itemId: string; quantity: number }) {
    if (0 < event.quantity) {
      this.adjustItemQuantity(event.itemId, event.quantity);
    } else {
      this.removeItem(event.itemId);
    }
  }

  private adjustItemQuantity(id: string, qty: number) {
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
            break;
          case 'NegativeQuantityError':
          case 'OrderLimitError':
          case 'OrderModificationError':
            this.notificationService.error(adjustOrderLine.message);
            break;
        }
      });
  }

  private removeItem(id: string) {
    this.dataService
      .mutate<RemoveItemFromCart.Mutation, RemoveItemFromCart.Variables>(REMOVE_ITEM_FROM_CART, {
        id,
      })
      .pipe(take(1))
      .subscribe();
  }

  private async removeAllItems(couponCodes: string[]) {
    await from(couponCodes)
      .pipe(
        concatMap(couponCode => this.dataService.mutate(REMOVE_COUPON_CODE, { couponCode }).pipe(take(1))),
      )
      .toPromise();
    await this.dataService.mutate(REMOVE_ALL_ITEM_FROM_CART).pipe(take(1)).subscribe();
  }

  @HostListener('window:popstate', ['$event'])
  onPopState(event: any) {
    if (!this.visible) {
      return;
    }

    event.preventDefault();
    event.stopPropagation();
    this.doClose(true);
  }
}
