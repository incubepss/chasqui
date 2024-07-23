import { BehaviorSubject, Observable } from 'rxjs';
import { Injectable } from '@angular/core';

import { map } from 'rxjs/operators';
import { DataService } from '../../core/providers/data/data.service';
import { CheckoutModule } from '../checkout.module';
import { CREATE_ORDER_GROUP, DEACTIVATE_ORDER_GROUP } from './checkout.orderGroup.graphql';

@Injectable({ providedIn: CheckoutModule })
export class CheckoutOrderGroupService {
  constructor(private dataService: DataService) {}

  activateOrderGroup() {
    return this.dataService
      .mutate<any, any>(CREATE_ORDER_GROUP, {})
      .pipe(map(r => r.createOrderGroupActiveOrder))
      .toPromise();
  }

  async deactivateOrderGroup(): Promise<any> {
    return this.dataService
      .mutate<any, any>(DEACTIVATE_ORDER_GROUP, {})
      .pipe(map(r => r.deactivateOrderGroupActiveOrder))
      .toPromise();
  }
}
