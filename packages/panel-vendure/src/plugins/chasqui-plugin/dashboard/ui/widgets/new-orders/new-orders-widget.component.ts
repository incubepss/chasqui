import { ChangeDetectionStrategy, Component, NgModule, OnInit } from '@angular/core';
import { CoreModule, DataService, GetOrderList, SharedModule, SortOrder } from '@vendure/admin-ui/core';
import { Observable } from 'rxjs';

@Component({
  selector: 'chq-new-orders-widget',
  templateUrl: './new-orders-widget.component.html',
  styleUrls: ['./new-orders-widget.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NewOrdersWidgetComponent implements OnInit {
  latestOrders$: Observable<GetOrderList.Items[]>;
  constructor(private dataService: DataService) {}

  ngOnInit(): void {
    this.latestOrders$ = this.dataService.order
      .getOrders({
        take: 10,
        filter: {
          active: { eq: false },
          state: { in: ['ArrangingPayment', 'PaymentAuthorized', 'PaymentSettled'] },
        },
        sort: {
          orderPlacedAt: SortOrder.ASC,
        },
      })
      .refetchOnChannelChange()
      .mapStream(data => data.orders.items);
  }
}

@NgModule({
  imports: [CoreModule, SharedModule],
  declarations: [NewOrdersWidgetComponent],
})
export class LatestOrdersWidgetModule {}
