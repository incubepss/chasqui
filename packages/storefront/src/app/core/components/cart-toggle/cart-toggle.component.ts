import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { from, interval, merge, Observable, timer, zip } from 'rxjs';
import { delay, distinctUntilChanged, map, refCount, share, shareReplay, switchMap } from 'rxjs/operators';

import { StateService } from '../../providers/state/state.service';
import { CartManager } from './../../../shared/services/cart.manager';

@Component({
  selector: 'vsf-cart-toggle',
  templateUrl: './cart-toggle.component.html',
  styleUrls: ['./cart-toggle.component.scss'],
})
export class CartToggleComponent implements OnInit {
  @Output() toggle = new EventEmitter<void>();
  cart$: Observable<{ total: number; quantity: number }>;
  cartChangeIndication$: Observable<boolean>;

  constructor(private stateService: StateService, private cartManager: CartManager) {}

  ngOnInit() {
    this.cart$ = this.cartManager.cart$.pipe(
      map(activeOrder => {
        return {
          total: activeOrder ? activeOrder.totalWithTax : 0,
          quantity: activeOrder ? activeOrder.totalQuantity : 0,
        };
      }),
    );

    this.cartChangeIndication$ = this.cart$.pipe(
      map(cart => cart.quantity),
      distinctUntilChanged(),
      switchMap(() => zip(from([true, false]), timer(0, 1000), val => val)),
    );
  }
}
