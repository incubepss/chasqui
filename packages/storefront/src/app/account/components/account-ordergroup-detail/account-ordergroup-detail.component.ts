import { ActivatedRoute, Router } from '@angular/router';
import { ChangeDetectionStrategy, Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { BehaviorSubject, combineLatest, Observable } from 'rxjs';
import { filter, map, switchMap, take, shareReplay } from 'rxjs/operators';

import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { analyzeAndValidateNgModules } from '@angular/compiler';
import { notNullOrUndefined } from '../../../common/utils/not-null-or-undefined';
import { Order, OrderGroup } from '../../../common/generated-types';
import { DataService } from '../../../core/providers/data/data.service';
import { NotificationService } from '../../../core/providers/notification/notification.service';
import { OrderGroupService } from '../../../shared/services/order-group.service';

import {
  CONFIRM_ORDER_GROUP,
  CANCEL_ORDER_GROUP,
  GET_ORDER_GROUP,
} from './account-ordergroup-detail.graphql';

const TAKE_PER_PAGE = 10;

@Component({
  selector: 'vsf-account-ordergroup-detail',
  templateUrl: './account-ordergroup-detail.component.html',
  styleUrls: ['./account-ordergroup-detail.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AccountOrderGroupDetailComponent implements OnInit {
  orderGroup$: Observable<OrderGroup>;

  notFound$: Observable<boolean>;
  shareUrl$: Observable<string>;

  orders$: Observable<Order[] | undefined>;
  verTodos = false;
  displayLoadMore = false;
  displayEmptyResult = false;
  loading = false;

  currentPage = 0;

  hasActiveOrder$: Observable<boolean>;
  private refresh = new BehaviorSubject<void>(undefined);

  constructor(
    private dataService: DataService,
    private changeDetector: ChangeDetectorRef,
    private route: ActivatedRoute,
    private router: Router,
    private notificationService: NotificationService,
    private modalService: NgbModal,
    private orderGroupService: OrderGroupService,
  ) {}

  ngOnInit() {
    const triggerFetch$ = combineLatest([this.route.paramMap, this.refresh]);

    this.orderGroup$ = triggerFetch$.pipe(
      map(([pm]) => pm?.get('code')),
      filter(notNullOrUndefined),
      switchMap(code => {
        return this.dataService.query<any, any>(GET_ORDER_GROUP, { code }, 'no-cache');
      }),
      map(data => data.orderGroupByCode),
      map(orderGroup => {
        if (!orderGroup.orders?.items) {
          return orderGroup;
        }

        let items = new Array<any>().concat(orderGroup.orders.items);
        if (items) {
          items = items.sort((a, b) => {
            if (!a.orderPlacedAt && !b.orderPlacedAt) {
              return 0;
            }
            if (!a.orderPlacedAt) {
              return 1;
            }
            if (!b.orderPlacedAt) {
              return -1;
            }
            if (a.orderPlacedAt < b.orderPlacedAt) {
              return 1;
            }
            if (a.orderPlacedAt > b.orderPlacedAt) {
              return -1;
            }
            return 0;
          });
        }
        const cloned = {
          ...orderGroup,
          orders: {
            ...orderGroup.orders,
            items,
          },
        };
        return cloned;
      }),
      shareReplay(1),
    );

    this.notFound$ = this.orderGroup$.pipe(map(g => !g));

    this.shareUrl$ = this.orderGroup$.pipe(
      map(og => {
        return this.orderGroupService.getShareUrlForGroup(og);
      }),
    );

    this.orders$ = this.orderGroup$.pipe(map(g => g.orders?.items));
    this.hasActiveOrder$ = this.orders$.pipe(
      map(orders => {
        if (!orders) {
          return false;
        }

        return orders.reduce((result, o) => result || o.active, false as boolean);
      }),
    );
  }

  async confirm(content: any) {
    const orderGroup = await this.orderGroup$.pipe(take(1)).toPromise();

    if (orderGroup?.ordersQuantity < 1) {
      this.notificationService.error('El pedido grupal está vacío, no se puede enviar');
      return;
    }

    this.modalService.open(content, { centered: true }).result.then(
      result => {
        this.doProceedConfirm(orderGroup);
      },
      // eslint-disable-next-line @typescript-eslint/no-empty-function
      () => {},
    );
  }

  async doProceedConfirm(orderGroup: OrderGroup) {
    if (!orderGroup.active) {
      this.notificationService.info('El pedido grupal no está activo');
      return;
    }

    this.dataService
      .mutate<any, any>(CONFIRM_ORDER_GROUP, {
        code: orderGroup.code,
      })
      .subscribe(
        response => {
          const resultOG: OrderGroup = response.confirmOrderGroup;
          if (resultOG?.state === 'ConfirmedByOwner') {
            this.refresh.next();
            this.notificationService.success('Pedido grupal confirmado');
            return;
          }

          this.notificationService.error('No se pudo confirmar el pedido grupal');
        },
        err => {
          console.error(err);
          this.notificationService.error('No se pudo confirmar el pedido grupal');
        },
      );
  }

  async cancel(content: any) {
    const orderGroup = await this.orderGroup$.pipe(take(1)).toPromise();

    this.modalService.open(content, { centered: true }).result.then(
      result => {
        this.doProceedCancel(orderGroup);
      },
      // eslint-disable-next-line @typescript-eslint/no-empty-function
      () => {},
    );
  }

  async doProceedCancel(orderGroup: OrderGroup) {
    if (orderGroup.state === 'Cancelled') {
      this.notificationService.info('El pedido grupal ya está cancelado');
      return;
    }

    const orders = await this.orders$.pipe(take(1)).toPromise();
    const hasOrders = (orders?.length || 0) > 0;

    this.dataService
      .mutate<any, any>(CANCEL_ORDER_GROUP, {
        id: orderGroup.id,
      })
      .subscribe(
        response => {
          const resultOG: OrderGroup = response.cancelOrderGroup;
          if (resultOG?.state === 'Cancelled') {
            if (hasOrders) {
              this.refresh.next();
            } else {
              this.router.navigate(['/micuenta']);
            }
            this.notificationService.success('Pedido grupal fué cancelado');
            return;
          }

          this.notificationService.error('No se pudo cancelar el pedido grupal');
        },
        err => {
          console.error(err);
          this.notificationService.error('No se pudo cancelar el pedido grupal');
        },
      );
  }

  async orderToClipboard(order: OrderGroup) {
    const error = await this.orderCopyToClipboard(order);
    if (error) {
      this.notificationService.error(error);
    } else {
      this.notificationService.success('Datos copiados al portapapeles');
    }
  }

  orderCopyToClipboard = async (orderGroup: OrderGroup): Promise<string> => {
    if (!navigator.clipboard) {
      return 'El portapapeles no está disponible';
    }

    if (!orderGroup) {
      return 'Pedido no disponible';
    }

    const orders = await this.orders$.pipe(take(1)).toPromise();
    const orderPaymentAuthorized = orders?.filter(order => order.state === 'PaymentAuthorized');
    const ordersCsv =
      orderPaymentAuthorized?.map(order => {
        return [
          ['', ''],
          [order.code, order.state],
          [`${order.customer?.firstName} ${order.customer?.lastName}`, `(${order.customFields.alias})`],
          ['Fecha de la compra', order.orderPlacedAt],
          ['Total del pedido', order.totalWithTax / 100],
          ['', ''],
          ['Nombre Producto', 'Cantidad'],
          ...order.lines.map(line => [line.productVariant.name, line.quantity]),
        ];
      }) || [];

    const orderDetail = [
      [orderGroup.code],
      ['Total', orderGroup.totalWithTax / 100],
      ['Cantidad de pedidos', orderGroup.ordersQuantity],
      ['fecha del pedido grupal', orderGroup.updatedAt],
    ].concat(...ordersCsv);

    console.log('orderDetail', orderDetail);

    const rowsTxt = orderDetail.map(lines => lines.join('\t')).join('\n');
    return await navigator.clipboard.writeText(rowsTxt).then(
      () => {
        return '';
      },
      () => {
        return 'No se pudo copiar los registros';
      },
    );
  };
}
