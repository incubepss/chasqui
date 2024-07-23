import { notNullOrUndefined } from '@vendure/common/lib/shared-utils';
import { marker as _ } from '@biesbjerg/ngx-translate-extract-marker';
import { Component, OnInit, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import {
  SortOrder,
  OrderListOptions,
  DataService,
  NotificationService,
  ModalService,
  OrderDetailFragment,
} from '@vendure/admin-ui/core';
import { FulfillOrderDialogComponent } from '@vendure/admin-ui/order';
import { Payment } from '@vendure/core';

import { Observable, BehaviorSubject, merge, combineLatest } from 'rxjs';
import { switchMap, map, mapTo, debounceTime, take, filter } from 'rxjs/operators';

import { SharedFilterState } from '../../../shared/services/sharedFilter-state';

import { OrdersFlowState, VIRTUAL_STATE } from '../../services/ordersFlow-state';
import { DateRange } from '../dates-filter/dates-filter.component';
import ordersFlowUtils, {
  CounterByVirtualState,
  orderGroupStateToVirtualState,
  orderStateToVirtualState,
  newCounterVirtual,
  joinSumCounters,
} from '../../services/ordersFlow-utils';

import { orderCopyToClipboard } from '../../services/ordersFlow-copyToClipboard';
import { Order } from '../../generated-types';
import {
  GET_ORDER,
  FIND_ORDERS,
  OrderListFragment,
  COUNT_ORDERS_BY_STATE,
  FIND_ORDERS_GROUP,
  COUNT_ORDERSGROUP_BY_STATE,
} from './ordersFlow-list.graphql';

const makeFilterDate = (dateRange: DateRange) => {
  let placedAtStart: Date | string | undefined = dateRange.start;
  let placedAtEnd: Date | string | undefined = dateRange.end;

  if (placedAtStart instanceof Date) {
    placedAtStart = placedAtStart.toISOString();
  }

  if (placedAtEnd instanceof Date) {
    placedAtEnd = placedAtEnd.toISOString();
  }

  let filterDate = {};
  if (placedAtStart && placedAtEnd) {
    filterDate = {
      between: {
        start: placedAtStart,
        end: placedAtEnd,
      },
    };
  } else if (placedAtStart) {
    filterDate = {
      after: placedAtStart,
    };
  } else if (placedAtEnd) {
    filterDate = {
      before: placedAtEnd,
    };
  }
  return filterDate;
};
@Component({
  selector: 'vsf-ordersFlow-list',
  templateUrl: './ordersFlow-list.component.html',
  styleUrls: ['./ordersFlow-list.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OrdersFlowListComponent implements OnInit {
  orderListOptions: OrderListOptions = {};
  orderGroupListOptions: any = {};

  orders$: Observable<OrderListFragment[]>;
  ordersGroup$: Observable<any[]>;
  countByState$: Observable<CounterByVirtualState>;
  loading$: Observable<boolean>;

  ordersAndGroups$: Observable<any[]>;

  activeChannel$: Observable<any>;

  detail: any = undefined;
  isFocusFilterCode = false;

  get printMode$() {
    return this.stateUI.printMode;
  }

  private refresh = new BehaviorSubject<void>(undefined);

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private dataService: DataService,
    private notificationService: NotificationService,
    private modalService: ModalService,
    private changeDetector: ChangeDetectorRef,
    public stateUI: OrdersFlowState,
    public sharedState: SharedFilterState,
  ) {}

  get currentStatuses() {
    return this.stateUI.currentStatuses;
  }

  get take() {
    return this.stateUI.take;
  }

  get filterKeyString() {
    return this.stateUI.filterKeyString;
  }

  get filterShippingMethod() {
    return this.sharedState.filterShippingMethod;
  }

  get currentVirtualState() {
    return this.stateUI.currentVirtualState;
  }

  isOrderGroup(item: any): boolean {
    return item?.__typename === 'OrderGroup';
  }

  ngOnInit(): void {
    this.activeChannel$ = this.dataService.client
      .userStatus()
      .mapStream(data => data.userStatus.channels.find(c => c.id === data.userStatus.activeChannelId))
      .pipe(filter(notNullOrUndefined));

    this.orders$ = this.initOrders();
    this.ordersGroup$ = this.initOrdersGroup();

    this.ordersAndGroups$ = combineLatest([this.orders$, this.ordersGroup$]).pipe(
      map(([orders, ordersGroup]) => this.joinAndOrderByUpdateBy(orders, ordersGroup)),
    );

    this.ordersAndGroups$.subscribe(async (items: Array<any>) => {
      let selected = null;

      if (this.stateUI.selectedItemCode) {
        selected = items?.find(item => item.code === this.stateUI.selectedItemCode);
      }

      selected = selected || items?.[0];
      if (selected) {
        await this.openDetail(selected, true);
      }
    });

    this.countByState$ = this.refresh.pipe(
      debounceTime(100),
      switchMap(() => {
        const options: any = {};
        if (this.filterKeyString) {
          options.key = this.filterKeyString;
        } else {
          if (this.sharedState.filterShippingMethod) {
            options.shippingMethodId = this.sharedState.filterShippingMethod.id;
          }

          if (this.stateUI.dateRange) {
            options.orderPlacedAt = makeFilterDate(this.stateUI.dateRange);
          }
        }

        const countOrders$ = this.dataService
          .query(COUNT_ORDERS_BY_STATE, {
            options,
          })
          .refetchOnChannelChange()
          .mapStream((result: any) => {
            return this.countByVirtualState(result.countOrdersByState);
          });

        const countOrdersGroup$ = this.dataService
          .query(COUNT_ORDERSGROUP_BY_STATE, {
            options,
          })
          .refetchOnChannelChange()
          .mapStream((result: any) => {
            return this.countGroupByVirtualState(result.countOrdersGroupByState);
          });

        return combineLatest([countOrders$, countOrdersGroup$]).pipe(
          map(([countOrders, countGroups]) => {
            return joinSumCounters(countOrders, countGroups);
          }),
        );
      }),
    );

    this.loading$ = merge(this.refresh.pipe(mapTo(true)), this.orders$.pipe(mapTo(false)));
  }

  private initOrders(): Observable<OrderListFragment[]> {
    return this.refresh.pipe(
      debounceTime(100),
      switchMap(() => {
        const filter: any = {};

        filter.state = { in: this.currentStatuses };

        if (this.filterKeyString) {
          filter.key = { eq: this.filterKeyString };
        } else {
          if (this.sharedState.filterShippingMethod) {
            filter.shippingMethodId = { eq: this.sharedState.filterShippingMethod.id };
          }

          if (this.stateUI.dateRange) {
            filter.orderPlacedAt = makeFilterDate(this.stateUI.dateRange);
          }
        }

        this.detail = undefined;

        this.orderListOptions = {
          take: this.take,
          filter,
          sort: {
            updatedAt: SortOrder.DESC,
          },
        };

        return this.dataService
          .query(FIND_ORDERS, {
            options: this.orderListOptions,
          })
          .refetchOnChannelChange()
          .mapStream((result: any) => {
            return result.orders.items;
          });
      }),
    );
  }

  private initOrdersGroup(): Observable<any[]> {
    return this.refresh.pipe(
      debounceTime(100),
      switchMap(() => {
        const filter: any = {};

        filter.state = { in: this.stateUI.currentGroupStatuses };

        if (this.filterKeyString) {
          filter.key = { eq: this.filterKeyString };
        } else {
          if (this.sharedState.filterShippingMethod) {
            filter.shippingMethodId = { eq: this.sharedState.filterShippingMethod.id };
          }

          if (this.stateUI.dateRange) {
            filter.orderPlacedAt = makeFilterDate(this.stateUI.dateRange);
          }
        }

        this.orderGroupListOptions = {
          take: this.take,
          filter,
          sort: {
            updatedAt: SortOrder.DESC,
          },
        };

        return this.dataService
          .query(FIND_ORDERS_GROUP, {
            options: this.orderGroupListOptions,
          })
          .refetchOnChannelChange()
          .mapStream((result: any) => {
            return result.ordersGroup.items;
          });
      }),
    );
  }

  private joinAndOrderByUpdateBy(orders: any[], ordersGroup: any[]): any[] {
    orders = orders || [];
    ordersGroup = ordersGroup || [];
    const all = [...orders, ...ordersGroup];
    all.sort((a, b) => {
      if (a.updatedAt > b.updatedAt) {
        return -1;
      } else if (a.updatedAt < b.updatedAt) {
        return 1;
      }

      return 0;
    });
    return all;
  }

  clearFilterByKey() {
    this.isFocusFilterCode = false;
    this.stateUI.filterKeyString = '';
    this.refresh.next();
  }

  async openDetail(item: any, scrollTo = false) {
    if (!item) {
      return;
    }

    if ('ordersQuantity' in item) {
      // es grupo
      this.detail = item;
      this.changeDetector.markForCheck();
    } else {
      // es individual
      const result: any = await this.dataService.query(GET_ORDER, { id: item.id }).single$.toPromise();
      this.detail = result.order;
    }

    this.stateUI.selectedItemCode = item.code;
    this.changeDetector.markForCheck();

    if (scrollTo) {
      setTimeout(() => {
        document.querySelector('.itemRow.selected')?.scrollIntoView({ behavior: 'smooth' });
      });
    }
  }

  countByVirtualState(statsByState: Array<any>): CounterByVirtualState {
    const result = newCounterVirtual();

    statsByState.forEach(stat => {
      const virtualState = orderStateToVirtualState(stat.state);
      if (virtualState) {
        result[virtualState].count += stat.count;
        result[virtualState].sumAmount += stat.subTotalWithTax + stat.subTotalshippingWithTax;
      }
    });

    return result;
  }

  countGroupByVirtualState(statsByState: Array<any>): CounterByVirtualState {
    const result = newCounterVirtual();

    statsByState.forEach(stat => {
      const virtualState = orderGroupStateToVirtualState(stat.state);
      if (virtualState) {
        result[virtualState].count += stat.count;
        result[virtualState].sumAmount += stat.subTotalWithTax + stat.subTotalshippingWithTax;
      }
    });

    return result;
  }

  applyCodeFilter() {
    this.refresh.next();
  }

  onFilterShippingMethod(shippingMethod: any) {
    this.sharedState.filterShippingMethod = shippingMethod;
    this.refresh.next();
  }

  onFilterState(nextState: VIRTUAL_STATE) {
    this.stateUI.take = undefined;
    this.stateUI.currentVirtualState = nextState;
    if (nextState === 'ENTREGADOS') {
      this.stateUI.take = 50;
    }
    this.refresh.next();
  }

  onFilterDatesChange(dateRange: DateRange) {
    this.stateUI.dateRange = dateRange;
    this.refresh.next();
  }

  onRefresh() {
    this.refresh.next();
  }

  canToEnPreparacion(order): boolean {
    return this.currentVirtualState === 'NUEVOS' && order?.nextStates.find(i => i === 'WithFulfill');
  }

  async doAsEnPreparacion(order: any) {
    this.modalService
      .fromComponent(FulfillOrderDialogComponent, {
        size: 'xl',
        locals: {
          order,
        },
      })
      .subscribe(async input => {
        if (input) {
          await this.dataService.order.createFulfillment(input).pipe(take(1)).toPromise();
          const result = await this.dataService.order.getOrder(order.id).single$.toPromise();
          if (result?.order?.state === 'WithFulfill') {
            this.notificationService.success('El pedido se fijo como En preparación');
          }
          this.refresh.next();
        }
      });
  }

  canToEnviado(order): boolean {
    return this.currentVirtualState === 'EN_PREPARACION' && order.nextStates.find(i => i === 'Shipped');
  }

  async doAsEnviado(order: OrderDetailFragment) {
    const fulfill = order.fulfillments?.find(f => !!f.nextStates.find(fs => fs === 'Shipped'));
    if (!fulfill) {
      this.notificationService.error('El pedido no tiene una orden de entrega pendiente');
      return;
    }
    const response = await this.dataService.order
      .transitionFulfillmentToState(fulfill.id, 'Shipped')
      .toPromise();
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    if (response?.transitionFulfillmentToState?.state === 'Shipped') {
      this.notificationService.success('El pedido se fijo como En entrega');
      this.refresh.next();
    } else {
      this.notificationService.error('No se pudo cambiar el estado');
    }
  }

  canToEntregado(order): boolean {
    return this.currentVirtualState === 'EN_ENTREGA' && order.nextStates.find(i => i === 'Delivered');
  }

  async doAsEntregado(order: OrderDetailFragment) {
    const fulfill = order.fulfillments?.find(f => !!f.nextStates.find(fs => fs === 'Delivered'));
    if (!fulfill) {
      this.notificationService.error('El pedido no tiene una orden de entrega enviada');
      return;
    }
    const response = await this.dataService.order
      .transitionFulfillmentToState(fulfill.id, 'Delivered')
      .toPromise();
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    if (response?.transitionFulfillmentToState?.state === 'Delivered') {
      this.notificationService.success('El pedido se fijo como Entregado');
      this.refresh.next();
    } else {
      this.notificationService.error('No se pudo cambiar el estado');
    }
  }

  async toPrint() {
    window.print();
  }

  previewMode(show: boolean) {
    this.stateUI.printMode.next(show);
    this.changeDetector.markForCheck();
  }

  getTypeDelivery(order: any): string {
    return ordersFlowUtils.getTypeDelivery(order);
  }

  getShippingMethod(order): string {
    return ordersFlowUtils.getShippingMethodName(order);
  }

  getAddressDelivery(order: any): string {
    return ordersFlowUtils.getAddressDelivery(order);
  }

  getComment(order: any): string {
    return order?.payments?.[0]?.metadata?.comments || 'sin notas';
  }

  getQuantityDescription(order: any): string {
    const countArt = order?.lines?.length || 0;
    const countUni = order?.totalQuantity;

    const part: string[] = [];
    if (countArt === 1) {
      part.push('1 artículo');
    } else {
      part.push(`${countArt} artículos`);
    }

    if (countUni === 1) {
      part.push('1 unidad');
    } else {
      part.push(`${countUni} unidades`);
    }

    return part.join(' / ');
  }

  hasAllPayment(order: any): boolean {
    const sumSettled = order.payments?.reduce((tmp, current) => {
      if (current.state === 'Settled') {
        return tmp + current.amount;
      }
      return tmp;
    }, 0);
    return sumSettled >= order.totalWithTax;
  }

  transitionToModifying(order: any) {
    if (order.state == 'Modifying') {
      this.router.navigate(['./', order.id, 'modify'], { relativeTo: this.route });
      return;
    }

    this.dataService.order
      .transitionToState(order.id, 'Modifying')
      .subscribe(({ transitionOrderToState }) => {
        switch (transitionOrderToState?.__typename) {
          case 'Order':
            this.router.navigate(['./', order.id, 'modify'], { relativeTo: this.route });
            break;
          case 'OrderStateTransitionError':
            this.notificationService.error(transitionOrderToState.transitionError);
        }
      });
  }

  transitionPaymentToSettled(payment: Payment) {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    this.dataService.order.settlePayment(payment.id).subscribe(({ settlePayment }) => {
      switch (settlePayment.__typename) {
        case 'Payment':
          if (settlePayment.state === 'Settled') {
            this.notificationService.success(_('order.settle-payment-success'));
            this.openDetail(this.detail);
          } else {
            this.notificationService.error(_('order.settle-payment-error'));
          }
          break;
        case 'OrderStateTransitionError':
        case 'PaymentStateTransitionError':
        case 'SettlePaymentError':
          this.notificationService.error(settlePayment.message);
      }
    });
  }

  async orderToClipboard(order: Order) {
    const error = await orderCopyToClipboard(order);
    if (error) {
      this.notificationService.error(error);
    } else {
      this.notificationService.success('Datos copiados al portapapeles');
    }
  }
}
