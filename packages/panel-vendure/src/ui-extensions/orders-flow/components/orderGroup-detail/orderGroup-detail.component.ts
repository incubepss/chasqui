import { marker as _ } from '@biesbjerg/ngx-translate-extract-marker';
import {
  Component,
  OnInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Input,
  Output,
  EventEmitter,
  ViewChild,
} from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { DataService, NotificationService, ModalService } from '@vendure/admin-ui/core';
import { notNullOrUndefined } from '@vendure/common/lib/shared-utils';
import { FulfillOrderDialogComponent } from '@vendure/admin-ui/order';

import { Observable, BehaviorSubject, combineLatest } from 'rxjs';
import { switchMap, filter, distinctUntilChanged } from 'rxjs/operators';

import { SharedFilterState } from '../../../shared/services/sharedFilter-state';

import { OrderGroup } from '../../generated-types';
import { OrdersFlowState } from '../../services/ordersFlow-state';

import ordersFlowUtils from '../../services/ordersFlow-utils';
import {
  CANCEL_ORDER_GROUP,
  CREATE_FULFILLMENT_GROUP,
  GET_ORDER_GROUP,
  GET_ORDER_GROUP_LINES,
  TRANSITON_ORDERGROUP_TO_DELIVERED,
  TRANSITON_ORDERGROUP_TO_SHIPPED,
} from './orderGroup-detail.graphql';

@Component({
  selector: 'vsf-orderGroup-detail',
  templateUrl: './orderGroup-detail.component.html',
  styleUrls: ['./orderGroup-detail.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OrderGroupDetailComponent implements OnInit {
  @Input()
  set orderGroup(value: OrderGroup) {
    this._inputValue.next(value);
  }

  private _inputValue = new BehaviorSubject<any>(undefined);

  @Output()
  change = new EventEmitter<any>();

  @ViewChild('byProduct') byProduct;
  @ViewChild('byCustomer') byCustomer;
  @ViewChild('allOrders') allOrders;

  loading$: Observable<boolean>;

  orderGroup$: Observable<OrderGroup | undefined>;
  activeChannel$: Observable<any>;

  get printMode$() {
    return this.stateUI.printMode;
  }

  private refresh = new BehaviorSubject<void>(undefined);

  isFocusFilterCode = false;
  isLoadingLines = false;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private dataService: DataService,
    private notificationService: NotificationService,
    private modalService: ModalService,
    private changeDetector: ChangeDetectorRef,
    public sharedState: SharedFilterState,
    private stateUI: OrdersFlowState,
  ) {}

  ngOnInit(): void {
    this.activeChannel$ = this.dataService.client
      .userStatus()
      .mapStream(data => data.userStatus.channels.find(c => c.id === data.userStatus.activeChannelId))
      .pipe(filter(notNullOrUndefined));

    this.orderGroup$ = combineLatest([
      this._inputValue.pipe(
        filter(value => !!value),
        distinctUntilChanged(),
      ),
      this.refresh,
    ]).pipe(
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      switchMap(([orderGroup]) => {
        if (!orderGroup) {
          return;
        }

        return this.dataService
          .query(GET_ORDER_GROUP, {
            code: orderGroup?.code,
          })
          .refetchOnChannelChange()
          .mapSingle((result: any) => {
            return result.orderGroupByCode;
          });
      }),
    );
  }

  onRefresh() {
    this.refresh.next();
  }

  canToEnPreparacion(order): boolean {
    return order.state === 'ConfirmedByOwner';
  }

  async doAsEnPreparacion(order: any) {
    this.isLoadingLines = true;
    this.changeDetector.markForCheck();
    let orderWithLines;

    try {
      orderWithLines = await this.getOrderGroupLines(order.code);
    } catch (e) {
      this.notificationService.error('No se pudieron traer los artículos del pedido');
      return;
    } finally {
      this.isLoadingLines = false;
      this.changeDetector.markForCheck();
    }

    this.modalService
      .fromComponent(FulfillOrderDialogComponent, {
        size: 'xl',
        locals: {
          order: orderWithLines,
        },
      })
      .subscribe(async input => {
        if (input) {
          const fulfillment = await this.dataService
            .mutate<any, any>(CREATE_FULFILLMENT_GROUP, {
              orderGroupId: order.id,
              input,
            })
            .toPromise()
            .then(result => result.addFulfillmentToOrderGroup);

          switch (fulfillment.__typename) {
            case 'Fulfillment':
              this.notificationService.success(_('order.create-fulfillment-success'));
              this.change.emit(order);
              break;
            case 'EmptyOrderLineSelectionError':
            case 'InsufficientStockOnHandError':
            case 'ItemsAlreadyFulfilledError':
            case 'InvalidFulfillmentHandlerError':
              this.notificationService.error(fulfillment.message);
              break;
            case 'FulfillmentStateTransitionError':
              this.notificationService.error(fulfillment.transitionError);
              break;
            case 'CreateFulfillmentError':
              this.notificationService.error(fulfillment.fulfillmentHandlerError);
              break;
            case undefined:
              this.notificationService.error(JSON.stringify(fulfillment));
              break;
            default:
              this.notificationService.error('Ops! se produjo un error inesperado, intente más tarde');
          }
        }
      });
  }

  getOrderGroup(code: string): Promise<any> {
    return this.dataService
      .query(GET_ORDER_GROUP, { code })
      .single$.toPromise()
      .then((r: any) => r.orderGroupByCode);
  }

  /**
   * Para crear el fulfilment
   */
  getOrderGroupLines(code: string): Promise<any> {
    return this.dataService
      .query(GET_ORDER_GROUP_LINES, { code })
      .single$.toPromise()
      .then((r: any) => r.orderGroupByCode);
  }

  canToEnviado(order: OrderGroup): boolean {
    return order.state === 'AcceptedByChannel';
  }

  async doAsEnviado(orderGroup: OrderGroup) {
    const response: any = await this.dataService
      .mutate(TRANSITON_ORDERGROUP_TO_SHIPPED, {
        orderGroupId: orderGroup.id,
      })
      .toPromise();

    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    if (response?.transitionToShipped?.state === 'Shipped') {
      this.notificationService.success('El pedido se fijo como En entrega');
      this.change.emit(response?.transitionToShipped);
    } else {
      this.notificationService.error('No se pudo cambiar el estado');
    }
  }

  canToEntregado(order: OrderGroup): boolean {
    return order.state === 'Shipped';
  }

  async doAsEntregado(orderGroup: OrderGroup) {
    const response: any = await this.dataService
      .mutate(TRANSITON_ORDERGROUP_TO_DELIVERED, {
        orderGroupId: orderGroup.id,
      })
      .toPromise();

    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    if (response?.transitionToDelivered?.state === 'Delivered') {
      this.notificationService.success('El pedido se fijo como Enviado');
      this.change.emit(response?.transitionToDelivered);
    } else {
      this.notificationService.error('No se pudo cambiar el estado');
    }
  }

  async doAsCancell(orderGroup: OrderGroup) {
    if (orderGroup?.state === 'Cancelled') {
      return;
    }

    this.modalService
      .dialog({
        title: 'Cancelar pedido en grupo',
        body: `Todos los pedidos participantes se cancelaran \n ¿Deseas continuar?`,
        buttons: [
          { type: 'secondary', label: 'No' },
          { type: 'danger', label: 'Cancelar el pedido', returnValue: true },
        ],
      })
      .subscribe((response: any) => {
        if (response) {
          this._doAsCancelled(orderGroup);
        }
      });
  }

  async _doAsCancelled(orderGroup: OrderGroup) {
    const response: any = await this.dataService
      .mutate(CANCEL_ORDER_GROUP, {
        orderGroupId: orderGroup.id,
      })
      .toPromise();

    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    if (response?.cancelOrderGroup?.state === 'Cancelled') {
      this.notificationService.success('El pedido fué cancelado');
      this.change.emit(response?.cancelOrderGroup);
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
    if (order.lines) {
      if (countArt === 1) {
        part.push('1 artículo');
      } else {
        part.push(`${countArt} artículos`);
      }
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

  toClipboard() {
    const child = this.byCustomer || this.byProduct || this.allOrders;
    if (child?.toClipboard) {
      child.toClipboard();
    }
  }
}
