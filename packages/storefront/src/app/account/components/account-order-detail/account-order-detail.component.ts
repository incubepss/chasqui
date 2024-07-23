import { Location } from '@angular/common';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { combineLatest, Observable, of } from 'rxjs';
import { filter, map, switchMap, catchError, take, shareReplay } from 'rxjs/operators';

import { GetOrder, Order, AddToCart } from '../../../common/generated-types';
import { notNullOrUndefined } from '../../../common/utils/not-null-or-undefined';

import { DataService } from '../../../core/providers/data/data.service';
import { ADD_TO_CART } from '../../../core/components/product-detail/product-detail.graphql';
import { CartManager } from './../../../shared/services/cart.manager';
import { NotificationService } from './../../../core/providers/notification/notification.service';
import { StateService } from './../../../core/providers/state/state.service';

import { CANCEL_ORDER_OF_GROUP, GET_ORDER } from './account-order-detail.graphql';

@Component({
  selector: 'vsf-account-order-detail',
  templateUrl: './account-order-detail.component.html',
  styleUrls: ['./account-order-detail.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AccountOrderDetailComponent implements OnInit {
  isGroupManagerContext$: Observable<boolean>;
  order$: Observable<GetOrder.OrderByCode | undefined>;
  notFound$: Observable<boolean>;

  showCancelButton$: Observable<boolean>;
  comments$: Observable<string | undefined>;

  paymentMethod: any;
  paymentErrorMessage = '';
  busy = false;

  constructor(
    private dataService: DataService,
    private stateService: StateService,
    private notificationService: NotificationService,
    private modalService: NgbModal,
    private route: ActivatedRoute,
    private location: Location,
    private changeDetector: ChangeDetectorRef,
    private cartManager: CartManager,
  ) {}

  ngOnInit() {
    this.isGroupManagerContext$ = this.route.url.pipe(
      map(segments => !!segments.find(segment => segment.path === 'grupos')),
    );

    this.order$ = this.route.paramMap.pipe(
      map(pm => pm.get('code')),
      filter(notNullOrUndefined),
      switchMap(code => {
        return this.dataService.query<GetOrder.Query, GetOrder.Variables>(GET_ORDER, { code }, 'no-cache');
      }),
      map(data => data.orderByCode),
      shareReplay(1),
      catchError(error => {
        return of(undefined);
      }),
    );

    this.notFound$ = this.order$.pipe(map(c => !c));

    this.comments$ = this.order$.pipe(
      map(order => {
        // @ts-ignore
        return order?.payments[0]?.metadata?.comments;
      }),
    );

    this.showCancelButton$ = combineLatest([this.route.paramMap, this.order$]).pipe(
      map(([pm, order]) => {
        return (
          !!pm.get('codeGroup') &&
          order?.state !== 'Cancelled' &&
          // @ts-ignore
          order?.customFields?.orderGroup?.active === true
        );
      }),
    );
  }

  async cancelOrder(content: any) {
    const order = await this.order$.pipe(take(1)).toPromise();
    if (!order) {
      return;
    }

    this.modalService.open(content, { centered: true }).result.then(
      result => {
        this.doProceedCancel(order);
      },
      // eslint-disable-next-line @typescript-eslint/no-empty-function
      () => {},
    );
  }

  async doProceedCancel(order: GetOrder.OrderByCode) {
    if (order.state === 'Cancelled') {
      this.notificationService.info('El pedido ya está cancelado');
      return;
    }

    this.dataService
      .mutate<any, any>(CANCEL_ORDER_OF_GROUP, {
        orderId: order.id,
        //@ts-ignore
        orderGroupId: order?.customFields?.orderGroup.id,
      })
      .subscribe(
        response => {
          const resultOG: Order = response.cancelOrderOfGroup;
          if (resultOG?.state === 'Cancelled') {
            this.notificationService.success('El pedido fué cancelado');
            return;
          }

          this.notificationService.error('No se pudo cancelar el pedido');
        },
        err => {
          console.error(err);
          this.notificationService.error('No se pudo cancelar el pedido');
        },
      );
  }

  async confirmOrder(content: any) {
    const order = await this.order$.pipe(take(1)).toPromise();
    if (!order) {
      return;
    }

    this.modalService.open(content, { centered: true }).result.then(
      result => {
        this.doProceedConfirm(order);
      },
      // eslint-disable-next-line @typescript-eslint/no-empty-function
      () => {},
    );
  }

  async doProceedConfirm(order: GetOrder.OrderByCode) {
    this.busy = true;
    this.changeDetector.markForCheck();

    const defaultMsgError = 'error al duplicar productos';

    try {
      await order.lines.reduce(async (previousPromise, line) => {
        await previousPromise;
        await this.addToCart(line.productVariant.id, line.quantity);
      }, Promise.resolve());
    } catch (e) {
      this.notificationService.error(defaultMsgError);
    } finally {
      this.busy = false;
      this.changeDetector.markForCheck();
    }
  }

  addToCart(variantId: string, qty: number): Promise<void> {
    return new Promise<void>(resolve => {
      this.dataService
        .mutate<AddToCart.Mutation, AddToCart.Variables>(ADD_TO_CART, {
          variantId,
          qty,
        })
        .subscribe(({ addItemToOrder }) => {
          switch (addItemToOrder.__typename) {
            case 'Order':
              this.cartManager.setActiveOrder(addItemToOrder);
              break;
            case 'OrderModificationError':
            case 'OrderLimitError':
            case 'NegativeQuantityError':
              this.notificationService.error(addItemToOrder.message);
              break;
            case 'InsufficientStockError':
              this.notificationService.error(addItemToOrder.message, '!uy!');
              break;
          }
          resolve();
        });
    });
  }

  back() {
    window.scroll(0, 0);
    this.location.back();
  }
}
