import { Component, OnInit, ChangeDetectionStrategy, Input } from '@angular/core';
import { DataService, NotificationService } from '@vendure/admin-ui/core';

import { Observable, BehaviorSubject, combineLatest } from 'rxjs';
import { map, switchMap, filter, distinctUntilChanged, take } from 'rxjs/operators';

import { SharedFilterState } from '../../../shared/services/sharedFilter-state';

import { OrderGroup } from '../../generated-types';
import { OrdersFlowState } from '../../services/ordersFlow-state';

import { orderGroupCopyToClipboard } from '../../services/ordersFlow-copyToClipboard';
import { GET_ORDER_GROUP_LINES } from './orderGroup-detail-byproduct.graphql';

@Component({
  selector: 'vsf-orderGroup-detail-byproduct',
  templateUrl: './orderGroup-detail-byproduct.component.html',
  styleUrls: ['./orderGroup-detail-byproduct.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OrderGroupDetailByProductComponent implements OnInit {
  @Input()
  set orderGroup(value: OrderGroup) {
    this.orderGroupInput = value;
    this._inputValue.next(value?.code);
  }

  private _inputValue = new BehaviorSubject<any>(undefined);

  loading$: Observable<boolean>;
  orderGroupInput: OrderGroup;
  orderGroup$: Observable<OrderGroup | undefined>;

  get printMode$() {
    return this.stateUI.printMode;
  }

  private refresh = new BehaviorSubject<void>(undefined);

  constructor(
    private dataService: DataService,
    public sharedState: SharedFilterState,
    private stateUI: OrdersFlowState,
    private notificationService: NotificationService,
  ) {}

  ngOnInit(): void {
    this.orderGroup$ = combineLatest([
      this._inputValue.pipe(
        filter(value => !!value),
        distinctUntilChanged(),
      ),
      this.refresh,
    ]).pipe(
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      switchMap(([orderGroupCode]) => {
        if (!orderGroupCode) {
          return;
        }

        return this.dataService
          .query(GET_ORDER_GROUP_LINES, {
            code: orderGroupCode,
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
    const linesGrouped = await this.orderGroup$
      .pipe(
        take(1),
        map(og => og?.linesGrouped || []),
      )
      .toPromise();

    const og = {
      ...this.orderGroupInput,
      linesGrouped,
    };

    const error = await orderGroupCopyToClipboard(og);
    if (error) {
      this.notificationService.error(error);
    } else {
      this.notificationService.success('Datos copiados al portapapeles');
    }
  }
}
