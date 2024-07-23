import { marker as _ } from '@biesbjerg/ngx-translate-extract-marker';
import { Component, OnInit, ChangeDetectionStrategy, ChangeDetectorRef, Input } from '@angular/core';
import { DataService, NotificationService } from '@vendure/admin-ui/core';

import { Observable, BehaviorSubject, merge, combineLatest } from 'rxjs';
import { switchMap, filter, mapTo, take, distinctUntilChanged } from 'rxjs/operators';

import { SharedFilterState } from '../../../shared/services/sharedFilter-state';

import { OrderGroup } from '../../generated-types';
import { OrdersFlowState } from '../../services/ordersFlow-state';

import { orderGroupCopyToClipboard } from '../../services/ordersFlow-copyToClipboard';
import { GET_ORDER_GROUP, GET_ORDER_GROUP_EXPANDED } from './orderGroup-detail-bycustomer.graphql';

@Component({
  selector: 'vsf-orderGroup-detail-bycustomer',
  templateUrl: './orderGroup-detail-bycustomer.component.html',
  styleUrls: ['./orderGroup-detail-bycustomer.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OrderGroupDetailByCustomerComponent implements OnInit {
  @Input()
  set orderGroup(value: OrderGroup) {
    this.expandedLines = true;
    this._inputValue.next(value);
  }

  private _inputValue = new BehaviorSubject<any>(undefined);

  loading$: Observable<boolean>;

  orderGroup$: Observable<OrderGroup | undefined>;

  get printMode$() {
    return this.stateUI.printMode;
  }

  private refresh = new BehaviorSubject<void>(undefined);

  expandedLines = false;

  constructor(
    private dataService: DataService,
    private notificationService: NotificationService,
    private changeDetector: ChangeDetectorRef,
    public sharedState: SharedFilterState,
    private stateUI: OrdersFlowState,
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

        const queryGql = this.expandedLines ? GET_ORDER_GROUP_EXPANDED : GET_ORDER_GROUP;

        return this.dataService
          .query(queryGql, {
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

  onRefresh() {
    this.refresh.next();
  }

  doExpandLines() {
    if (this.expandedLines) {
      return;
    }

    this.expandedLines = true;
    this.refresh.next();
    this.changeDetector.markForCheck();
  }

  async toPrint() {
    window.print();
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

  public async toClipboard() {
    const og = await this.orderGroup$.pipe(take(1)).toPromise();

    if (!og) {
      this.notificationService.error('Pedido no disponible');
      return;
    }

    const error = await orderGroupCopyToClipboard(og);
    if (error) {
      this.notificationService.error(error);
    } else {
      this.notificationService.success('Datos copiados al portapapeles');
    }
  }
}
