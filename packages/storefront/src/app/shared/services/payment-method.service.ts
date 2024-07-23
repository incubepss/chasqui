import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map, take } from 'rxjs/operators';

import { DataService } from '../../core/providers/data/data.service';
import { PaymentMethod } from '../../common/generated-types';

import { GET_PAYMENT_METHODS } from './payment-method.graphql';

@Injectable({
  providedIn: 'root',
})
export class PaymentMethodService {
  constructor(private dataService: DataService) {}

  findPaymentMethods(): Observable<PaymentMethod[]> {
    return this.dataService.query(GET_PAYMENT_METHODS).pipe(map(data => data.paymentMethods.items));
  }
}
