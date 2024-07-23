import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Resolve, RouterStateSnapshot } from '@angular/router';
import { Observable } from 'rxjs';
import { shareReplay, take } from 'rxjs/operators';

import { OrderGroupService } from '../../shared/services/order-group.service';
import { CheckoutModule } from '../checkout.module';

@Injectable({ providedIn: CheckoutModule })
export class ActiveOrderGroupsResolver implements Resolve<any[]> {
  constructor(private orderGroupService: OrderGroupService) {}

  resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<any[]> {
    return this.orderGroupService.findActiveGroups().pipe(shareReplay(1), take(1));
  }
}
