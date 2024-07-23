import { Injectable } from '@angular/core';
import { merge, Observable, BehaviorSubject, combineLatest } from 'rxjs';
import { map, shareReplay, switchMap } from 'rxjs/operators';

import { DataService } from '../../core/providers/data/data.service';
import { StateService } from '../../core/providers/state/state.service';
import { GetActiveOrder } from '../../common/generated-types';
import { UserInteractionService } from './user-interaction.service';
import { GET_ACTIVE_ORDER } from './cart.graphql';

@Injectable({
  providedIn: 'root',
})
export class CartManager {
  addToCartAllowed$: Observable<boolean>;

  /** pedidos individuales habilitados */
  orderSinglesAllowed$: Observable<boolean>;

  /** creación de pedidos grupales habilitados */
  orderGroupsAllowed$: Observable<boolean>;

  cart$: Observable<GetActiveOrder.ActiveOrder | null | undefined>;

  private _refresh = new BehaviorSubject<void>(undefined);

  constructor(
    private dataService: DataService,
    private stateService: StateService,
    private userInteractionService: UserInteractionService,
  ) {
    this.cart$ = merge(
      this._refresh,
      this.stateService.select(state => state.activeOrderId),
      this.stateService.select(state => state.signedIn),
    ).pipe(
      switchMap(() =>
        this.dataService.query<GetActiveOrder.Query, GetActiveOrder.Variables>(
          GET_ACTIVE_ORDER,
          {},
          'network-only',
        ),
      ),
      map(data => data.activeOrder),
      shareReplay(1),
    );

    this.orderSinglesAllowed$ = combineLatest([
      this.stateService.select(state => state.storeDisabled),
      this.stateService.select(state => state.orderSinglesEnabled),
      this.stateService.select(state => state.activeCustomer),
    ]).pipe(
      map(([storeDisabled, orderSinglesEnabled, activeCustomer]) => {
        return !storeDisabled && (orderSinglesEnabled || activeCustomer?.customFields?.orderSinglesEnabled);
      }),
    );

    this.orderGroupsAllowed$ = combineLatest([
      this.stateService.select(state => state.storeDisabled),
      this.stateService.select(state => state.orderGroupEnabled),
      this.stateService.select(state => state.activeCustomer),
    ]).pipe(
      map(([storeDisabled, orderGroupEnabled, activeCustomer]) => {
        return !storeDisabled && (orderGroupEnabled || activeCustomer?.customFields?.orderGroupEnabled);
      }),
    );

    /**
     * permite agregar items al carrito.
     * sii el consumidor tiene las compras individuales permitidas o está participando en un grupo
     */
    this.addToCartAllowed$ = combineLatest([this.orderSinglesAllowed$, this.cart$]).pipe(
      map(([orderSinglesAllowed, activeOrder]) => {
        // @ts-ignore
        const isOrderInAGroup = !!activeOrder?.customFields?.orderGroup?.id;
        return orderSinglesAllowed || isOrderInAGroup;
      }),
    );

    this.userInteractionService.onBackToTab$.subscribe(() => this.refresh());
  }

  clear() {
    this.setActiveOrder(null);
  }

  setActiveOrder(activeOrder: GetActiveOrder.ActiveOrder | null) {
    this.stateService.setState('activeOrderId', activeOrder?.id || null);
  }

  refresh() {
    this._refresh.next();
  }
}
