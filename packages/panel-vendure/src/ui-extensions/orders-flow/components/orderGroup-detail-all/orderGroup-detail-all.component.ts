import { Component, OnInit, ChangeDetectionStrategy, Input } from '@angular/core';
import { DataService, NotificationService, StateI18nTokenPipe } from '@vendure/admin-ui/core';

import { Observable, BehaviorSubject, merge, combineLatest } from 'rxjs';
import { switchMap, filter, mapTo, take, distinctUntilChanged } from 'rxjs/operators';
import { TranslatePipe } from '@ngx-translate/core';

import { SharedFilterState } from '../../../shared/services/sharedFilter-state';

import { Order, OrderGroup } from '../../generated-types';
import { OrdersFlowState } from '../../services/ordersFlow-state';

import { detailOrderGroupRow, copyTextToClipboard } from '../../services/ordersFlow-copyToClipboard';
import { GET_ALL_ORDERS_ORDERGROUP } from './orderGroup-detail-all.graphql';

@Component({
  selector: 'vsf-orderGroup-detail-all',
  templateUrl: './orderGroup-detail-all.component.html',
  styleUrls: ['./orderGroup-detail-all.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OrderGroupDetailAllComponent implements OnInit {
  @Input()
  set orderGroup(value: OrderGroup) {
    this._inputValue.next(value);
  }

  private _inputValue = new BehaviorSubject<any>(undefined);

  loading$: Observable<boolean>;

  orderGroup$: Observable<OrderGroup | undefined>;

  get printMode$() {
    return this.stateUI.printMode;
  }

  private refresh = new BehaviorSubject<void>(undefined);

  constructor(
    private dataService: DataService,
    private notificationService: NotificationService,
    public sharedState: SharedFilterState,
    private stateUI: OrdersFlowState,
    private translatePipe: TranslatePipe,
    private stateI18NTokenPipe: StateI18nTokenPipe,
  ) {}

  ngOnInit(): void {
    const combinedPipe = combineLatest([
      this._inputValue.pipe(
        filter(value => !!value),
        distinctUntilChanged(),
      ),
      this.refresh,
    ]);

    this.orderGroup$ = combinedPipe.pipe(
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      switchMap(([orderGroup]) => {
        if (!orderGroup) {
          return;
        }

        return this.dataService
          .query(GET_ALL_ORDERS_ORDERGROUP, {
            code: orderGroup?.code,
          })
          .refetchOnChannelChange()
          .mapSingle((result: any) => {
            return result.orderGroupByCode;
          });
      }),
    );

    this.loading$ = merge(combinedPipe.pipe(mapTo(true)), this.orderGroup$.pipe(mapTo(false)));
  }

  public async toClipboard() {
    const og = await this.orderGroup$.pipe(take(1)).toPromise();

    if (!og) {
      this.notificationService.error('Pedido no disponible');
      return;
    }

    const error = await this.orderGroupCopyToClipboard(og);
    if (error) {
      this.notificationService.error(error);
    } else {
      this.notificationService.success('Datos copiados al portapapeles');
    }
  }

  async orderGroupCopyToClipboard(orderGroup: OrderGroup): Promise<string | undefined> {
    if (!navigator.clipboard) {
      return 'El portapapeles no está disponible';
    }

    if (!orderGroup) {
      return 'Pedido no disponible';
    }

    let allRows: string[][] = [];

    // encabezado
    allRows = detailOrderGroupRow(orderGroup);

    // por todos los pedidos
    const orders = orderGroup?.orders;
    if (orders) {
      allRows = allRows.concat([[], []]).concat(this.allOrderOfGroupHeader());
      orders.items.forEach((order: Order) => {
        const rows = this.ordersTo2DPlainArray(order);
        allRows = allRows.concat(rows);
      });
    }

    const rowsTxt = allRows.map(lines => lines.join('\t')).join('\n');
    return copyTextToClipboard(rowsTxt);
  }

  allOrderOfGroupHeader(): string[][] {
    return [['Código', 'Persona', 'Email', 'Teléfono', 'Estado', 'Fecha', 'Total']];
  }

  ordersTo2DPlainArray(order: Order): string[][] {
    const customerName = `${order.customer?.firstName} ${order.customer?.lastName}`;
    const date = order.orderPlacedAt || order.createdAt;
    return [
      [
        order.code,
        customerName,
        order.customer?.emailAddress || '',
        order.customer?.phoneNumber || '',
        this.translatePipe.transform(this.stateI18NTokenPipe.transform(order.state)),
        date,
        (order.totalWithTax / 100).toString(),
      ],
    ];
  }
}
