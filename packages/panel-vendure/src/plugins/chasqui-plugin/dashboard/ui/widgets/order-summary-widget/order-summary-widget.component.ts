import { ChangeDetectionStrategy, Component, NgModule, OnInit } from '@angular/core';
import { CoreModule, DataService } from '@vendure/admin-ui/core';
import dayjs from 'dayjs';
import { BehaviorSubject, Observable } from 'rxjs';
import { distinctUntilChanged, map, shareReplay, switchMap } from 'rxjs/operators';
import { GET_ORDER_STATS } from './order-summary-widget.graphql';

export type Timeframe = 'day' | 'week' | 'month' | 'lastMonth';

@Component({
  selector: 'chq-order-summary-widget',
  templateUrl: './order-summary-widget.component.html',
  styleUrls: ['./order-summary-widget.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OrderSummaryWidgetComponent implements OnInit {
  today = new Date();
  yesterday = new Date(new Date().setDate(this.today.getDate() - 1));
  totalOrderCount$: Observable<number>;
  totalOrderValue$: Observable<number>;
  currencyCode$: Observable<string | undefined>;
  selection$ = new BehaviorSubject<{ timeframe: Timeframe; date?: Date }>({
    timeframe: 'day',
    date: this.today,
  });
  dateRange$: Observable<{ start: Date; end: Date }>;

  constructor(private dataService: DataService) {}

  ngOnInit(): void {
    this.dateRange$ = this.selection$.pipe(
      distinctUntilChanged(),
      map(selection => {
        if (selection.timeframe === 'lastMonth') {
          return {
            start: dayjs(selection.date).subtract(1, 'M').startOf('month').toDate(),
            end: dayjs(selection.date).subtract(1, 'M').endOf('month').toDate(),
          };
        }

        return {
          start: dayjs(selection.date).startOf(selection.timeframe).toDate(),
          end: dayjs(selection.date).endOf(selection.timeframe).toDate(),
        };
      }),
      shareReplay(1),
    );
    const orderStats$ = this.dateRange$.pipe(
      switchMap(({ start, end }) => {
        return this.dataService
          .query<any, any>(GET_ORDER_STATS, {
            start: start.toISOString(),
            end: end.toISOString(),
          })
          .refetchOnChannelChange()
          .mapStream(data => data.ordersSold);
      }),
      shareReplay(1),
    );

    this.totalOrderCount$ = orderStats$.pipe(map(res => res.quantity));
    this.totalOrderValue$ = orderStats$.pipe(map(res => res.totalWithTax));

    this.currencyCode$ = this.dataService.settings
      .getActiveChannel()
      .refetchOnChannelChange()
      .mapStream(data => data.activeChannel.currencyCode || undefined);
  }
}

@NgModule({
  imports: [CoreModule],
  declarations: [OrderSummaryWidgetComponent],
})
export class OrderSummaryWidgetModule {}
