import { Injectable } from '@angular/core';
import { map, tap } from 'rxjs/operators';

import { DataService } from '../../core/providers/data/data.service';
import { Order, GetActiveOrder, OrderGroup, ErrorResult } from './../../common/generated-types';

import { ChannelService } from './channel.service';

import {
  ASSIGN_ORDER_TO_GROUP,
  DEACTIVATE_ORDER_GROUP,
  GET_ACTIVE_GROUPS,
  GET_GROUP_BY_CODE,
} from './order-group.graphql';

@Injectable({
  providedIn: 'root',
})
export class OrderGroupService {
  constructor(private dataService: DataService, private channelService: ChannelService) {}

  findByCode(code: string) {
    return this.dataService.query<any, any>(GET_GROUP_BY_CODE, { code });
  }

  getShareUrlForGroup(orderGroup: OrderGroup): string {
    if (!orderGroup) {
      return '';
    }

    const baseUrl = this.channelService.activeChannelBaseUrl;
    return orderGroup ? `${baseUrl}/catalogo?gcode=${orderGroup.code}` : '';
  }

  findActiveGroups() {
    const options = {
      filter: {
        active: { eq: true },
      },
    };

    return this.dataService
      .query<any, any>(GET_ACTIVE_GROUPS, { options }, 'no-cache')
      .pipe(map(r => r.activeCustomer?.ordersGroup?.items || []));
  }

  async deactivateOrderGroup(): Promise<Order> {
    return this.dataService
      .mutate<any, any>(DEACTIVATE_ORDER_GROUP, {})
      .pipe(map(r => r.deactivateOrderGroupActiveOrder))
      .toPromise();
  }

  async assignActiveOrderToGroup(
    orderCode: string,
    alias: string = '',
  ): Promise<GetActiveOrder.ActiveOrder | ErrorResult> {
    return this.dataService
      .mutate<any, any>(ASSIGN_ORDER_TO_GROUP, {
        orderGroupCode: orderCode,
        alias,
      })
      .toPromise()
      .then(result => result.assignActiveOrderToGroup);
  }
}
