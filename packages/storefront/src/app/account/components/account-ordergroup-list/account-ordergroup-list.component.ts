import { ChangeDetectionStrategy, Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { Observable } from 'rxjs';
import { map, take } from 'rxjs/operators';

import { GetOrderList, OrderGroup, SortOrder } from '../../../common/generated-types';
import { DataService } from '../../../core/providers/data/data.service';

import { GET_ORDERS_GROUP_LIST } from './account-ordergroup-list.graphql';

const TAKE_PER_PAGE = 10;

@Component({
  selector: 'vsf-account-ordergroup-list',
  templateUrl: './account-ordergroup-list.component.html',
  styleUrls: ['./account-ordergroup-list.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AccountOrderGroupListComponent implements OnInit {
  orders: OrderGroup[] | undefined;
  displayLoadMore = false;
  displayEmptyResult = false;
  loading = false;

  currentPage = 0;

  constructor(private dataService: DataService, private changeDetector: ChangeDetectorRef) {}

  ngOnInit() {
    this.load();
  }

  async load() {
    this.loading = true;
    this.changeDetector.markForCheck();

    const result = await this.dataService
      .query<any, any>(
        GET_ORDERS_GROUP_LIST,
        {
          options: {
            filter: {},
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
        map(data => data.activeCustomer && data.activeCustomer.ordersGroup),
      )
      .toPromise();

    this.loading = false;
    const totalItems = result?.totalItems || 0;
    this.orders = (this.orders || []).concat(result?.items || []);
    this.displayLoadMore = totalItems > this.orders.length;

    this.displayEmptyResult = this.orders.length < 1;

    this.changeDetector.markForCheck();
  }

  loadMore() {
    this.currentPage += 1;
    this.load();
  }
}
