import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map, take } from 'rxjs/operators';

import { DataService } from '../../core/providers/data/data.service';
import { ShippingMethodList } from '../../common/generated-types';

import { GET_SHIPPING_METHODS } from './shipping-method.graphql';

@Injectable({
  providedIn: 'root',
})
export class ShippingMethodService {
  constructor(private dataService: DataService) {}

  findShippingMethods(): Observable<ShippingMethodList> {
    return this.dataService.query(GET_SHIPPING_METHODS).pipe(map(data => data.shippingMethods));
  }
}
