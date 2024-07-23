import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { filter, map } from 'rxjs/operators';
import { CartManager } from '../../../shared/services/cart.manager';

import { GetAccountOverview, Order, OrderGroup } from '../../../common/generated-types';
import { notNullOrUndefined } from '../../../common/utils/not-null-or-undefined';
import { DataService } from '../../../core/providers/data/data.service';

import { GET_ACCOUNT_OVERVIEW } from './account-dashboard.graphql';

@Component({
  selector: 'vsf-account-dashboard',
  templateUrl: './account-dashboard.component.html',
  styleUrls: ['./account-dashboard.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AccountDashboardComponent implements OnInit {
  activeCustomer$: Observable<GetAccountOverview.ActiveCustomer>;
  isOrderGroupEnabled$: Observable<boolean>;

  orders$: Observable<Order[]>;
  orderGroups$: Observable<OrderGroup[]>;

  constructor(private cartManager: CartManager, private dataService: DataService) {
    this.isOrderGroupEnabled$ = this.cartManager.orderGroupsAllowed$;
  }

  ngOnInit() {
    const optionsOrderGroup = {
      sort: {
        updatedAt: 'DESC',
      },
      take: 5,
    };

    const optionsOrder = {
      sort: {
        updatedAt: 'DESC',
      },
      take: 5,
    };

    this.activeCustomer$ = this.dataService
      .query<GetAccountOverview.Query>(
        GET_ACCOUNT_OVERVIEW,
        {
          optionsOrder,
          optionsOrderGroup,
        },
        'no-cache',
      )
      .pipe(
        map(data => data.activeCustomer),
        filter(notNullOrUndefined),
      );

    this.orders$ = this.activeCustomer$.pipe(map((data: any) => data.orders?.items || []));
    this.orderGroups$ = this.activeCustomer$.pipe(map((data: any) => data.ordersGroup?.items || []));
  }
}
