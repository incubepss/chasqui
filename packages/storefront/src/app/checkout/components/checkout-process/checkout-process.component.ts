import { ChangeDetectionStrategy, Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import { Observable, combineLatest } from 'rxjs';
import { filter, map, startWith, switchMap, take, tap } from 'rxjs/operators';

import {
  GetEligiblePaymentMethods,
  GetOrderForCheckout,
  GetNextOrderStates,
  TransitionToAddingItems,
} from '../../../common/generated-types';
import { DataService } from '../../../core/providers/data/data.service';
import { StateService } from '../../../core/providers/state/state.service';
import { CheckoutStoreService } from '../../providers/checkout.store.service';
import { CartManager } from './../../../shared/services/cart.manager';

import { GET_NEXT_ORDER_STATES, TRANSITION_TO_ADDING_ITEMS } from './checkout-process.graphql';

@Component({
  selector: 'vsf-checkout-process',
  templateUrl: './checkout-process.component.html',
  styleUrls: ['./checkout-process.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CheckoutProcessComponent implements OnInit {
  @ViewChild('checkoutMain')
  private checkoutMainContainer: ElementRef<HTMLDivElement>;

  cart$: Observable<GetOrderForCheckout.ActiveOrder | null | undefined>;
  nextStates$: Observable<string[]>;
  activeStage$: Observable<number>;
  signedIn$: Observable<boolean>;
  showOrderGroup$: Observable<boolean>;
  orderSinglesAllowed$: Observable<boolean>;

  paymentMethod$: Observable<GetEligiblePaymentMethods.EligiblePaymentMethods | null>;
  isStoreDisabled$: Observable<boolean>;
  isThanksStage$: Observable<boolean>;
  isOrderPartOfGroup$: Observable<boolean>;

  constructor(
    private dataService: DataService,
    private stateService: StateService,
    private cartManager: CartManager,
    private route: ActivatedRoute,
    private router: Router,
    private checkoutStore: CheckoutStoreService,
  ) {}

  ngOnInit() {
    this.isStoreDisabled$ = this.stateService.select(state => state.storeDisabled);
    this.orderSinglesAllowed$ = this.cartManager.orderSinglesAllowed$;
    this.paymentMethod$ = this.checkoutStore.select(state => state.paymentMethod);
    this.signedIn$ = this.stateService.select(state => state.signedIn);
    this.cart$ = this.route.data.pipe(
      switchMap(data => data.activeOrder as Observable<GetOrderForCheckout.ActiveOrder>),
    );

    this.showOrderGroup$ = combineLatest([
      this.stateService.select(state => state.orderGroupEnabled),
      this.cart$,
    ]).pipe(
      map(([orderGroupEnabled, cart]) => {
        // @ts-ignore
        return orderGroupEnabled || !!cart?.customFields.orderGroup;
      }),
    );

    this.nextStates$ = this.dataService
      .query<GetNextOrderStates.Query>(GET_NEXT_ORDER_STATES)
      .pipe(map(data => data.nextOrderStates));
    this.activeStage$ = this.router.events.pipe(
      filter(event => event instanceof NavigationEnd),
      startWith(true),
      tap(() => this.scrollTop()),
      map(() => {
        const firstChild = this.route.snapshot.firstChild;
        if (firstChild && firstChild.routeConfig) {
          switch (firstChild.routeConfig.path) {
            case '':
              return 1;
            case 'entrega':
              return 2;
            case 'pago':
              return 3;
            case 'confirmar':
              return 4;
            case 'gracias/:code':
              return 5;
          }
        }
        return 1;
      }),
    );

    this.isThanksStage$ = this.activeStage$.pipe(map(stage => stage === 5));

    this.isOrderPartOfGroup$ = this.cart$.pipe(
      map(
        c =>
          // @ts-ignore
          c?.customFields?.orderGroup && !c?.customFields?.isOrderHeadOfGroup,
      ),
    );
  }

  scrollTop() {
    if (this.checkoutMainContainer) {
      this.checkoutMainContainer.nativeElement.scrollTop = 0;
    }
  }

  async onStep(step: number) {
    const activeStage = await this.activeStage$.pipe(take(1)).toPromise();
    if (activeStage < step) {
      return;
    }

    if (step === 2) {
      this.router.navigate(['./entrega'], { relativeTo: this.route });
    } else if (step === 3) {
      this.router.navigate(['./pago'], { relativeTo: this.route });
    }
  }

  changeShippingAddress() {
    this.dataService.mutate<TransitionToAddingItems.Mutation>(TRANSITION_TO_ADDING_ITEMS).subscribe(() => {
      this.router.navigate(['./entrega'], { relativeTo: this.route });
    });
  }

  changeShippingMethod() {
    this.dataService.mutate<TransitionToAddingItems.Mutation>(TRANSITION_TO_ADDING_ITEMS).subscribe(() => {
      this.router.navigate(['./entrega'], { relativeTo: this.route });
    });
  }
}
