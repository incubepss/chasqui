import { Observable } from 'rxjs';
import { Component, ChangeDetectionStrategy, Input, OnInit } from '@angular/core';
import { map } from 'rxjs/operators';
import { StateService } from '../../providers/state/state.service';
import { CartManager } from '../../../shared/services/cart.manager';

@Component({
  selector: 'vsf-mobile-toolbar',
  templateUrl: './mobile-toolbar.component.html',
  styleUrls: ['./mobile-toolbar.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MobileToolbarComponent implements OnInit {
  @Input()
  backgroundColor = 'white';

  cartTotal$: Observable<number>;

  constructor(private stateService: StateService, private cartManager: CartManager) {}

  ngOnInit() {
    this.cartTotal$ = this.cartManager.cart$.pipe(map(activeCart => activeCart?.totalWithTax || 0));
  }

  toggleNavMenu() {
    this.stateService.setState('mobileNavMenuIsOpen', true);
  }

  toggleCateMenu() {
    this.stateService.setState('mobileCateMenuIsOpen', true);
  }

  toggleCart() {
    this.stateService.setState('cartDrawerOpen', true);
  }
}
