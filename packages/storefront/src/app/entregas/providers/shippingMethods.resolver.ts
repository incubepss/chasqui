import { Injectable } from '@angular/core';
import { Resolve, RouterStateSnapshot, ActivatedRouteSnapshot } from '@angular/router';
import { Observable } from 'rxjs';
import { map, take } from 'rxjs/operators';

import { ShippingMethodService } from '../../shared/services/shipping-method.service';
import { ShippingMethod } from '../../common/generated-types';

@Injectable({
  providedIn: 'root',
})
export class ShippingMethodsResolver implements Resolve<ShippingMethod[]> {
  constructor(private shippingMethodService: ShippingMethodService) {}

  resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<ShippingMethod[]> {
    const obs = this.shippingMethodService.findShippingMethods();
    return obs.pipe(
      take(1),
      map(list => list.items),
    );
  }
}
