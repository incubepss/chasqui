import { ChangeDetectionStrategy, Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { Observable } from 'rxjs';
import { map, take } from 'rxjs/operators';

import { Channel, GetOrderList, SortOrder } from '../../../common/generated-types';
import { DataService } from '../../../core/providers/data/data.service';
import { StateService } from './../../../core/providers/state/state.service';

import { GET_ORDER_LIST } from './account-order-list.graphql';

const TAKE_PER_PAGE = 10;

@Component({
  selector: 'vsf-account-order-list',
  templateUrl: './account-order-list.component.html',
  styleUrls: ['./account-order-list.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AccountOrderListComponent implements OnInit {
  orders: GetOrderList.Items[] | undefined;
  displayLoadMore = false;
  displayEmptyResult = false;
  loading = false;

  currentPage = 0;

  channelName$: Observable<string>;

  constructor(
    private dataService: DataService,
    private stateService: StateService,
    private changeDetector: ChangeDetectorRef,
  ) {}

  ngOnInit() {
    this.load();
  }

  async load() {
    this.loading = true;
    this.changeDetector.markForCheck();

    const result = await this.dataService
      .query<GetOrderList.Query, GetOrderList.Variables>(
        GET_ORDER_LIST,
        {
          options: {
            filter: {
              active: {
                eq: false,
              },
            },
            sort: {
              updatedAt: SortOrder.DESC,
            },
            take: TAKE_PER_PAGE,
            skip: this.currentPage * TAKE_PER_PAGE,
          },
        },
        'no-cache',
      )
      .pipe(
        take(1),
        map(data => data.activeCustomer && data.activeCustomer.orders),
      )
      .toPromise();

    this.loading = false;
    const totalItems = result?.totalItems || 0;
    this.orders = (this.orders || []).concat(result?.items || []);
    this.displayLoadMore = totalItems > this.orders.length;

    this.displayEmptyResult = this.orders.length < 1;

    this.changeDetector.markForCheck();

    this.channelName$ = this.stateService.select(state => state.activeChannelName);
  }

  loadMore() {
    this.currentPage += 1;
    this.load();
  }
}
