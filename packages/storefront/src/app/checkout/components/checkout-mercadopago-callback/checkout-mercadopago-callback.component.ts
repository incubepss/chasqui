/* eslint-disable @typescript-eslint/naming-convention */
import { Component, OnInit, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Observable, from } from 'rxjs';
import { filter, map, catchError, shareReplay, switchMap } from 'rxjs/operators';

import { DataService } from '../../../core/providers/data/data.service';

import { Order, GetOrderByCode } from '../../../common/generated-types';
import { notNullOrUndefined } from '../../../common/utils/not-null-or-undefined';
import { GET_ORDER_BY_CODE } from '../checkout-mercadopago/checkout-mercadopago.graphql';
import { MERCADOPAGO_STATUS_PAYMENT, PagoPublicMetadata } from '../checkout-mercadopago/mercadopago';
import { extractPagos } from './../checkout-mercadopago/mercadopago.utils';

@Component({
  selector: 'vsf-checkout-mercadopago-callback',
  templateUrl: './checkout-mercadopago-callback.component.html',
  styleUrls: ['./checkout-mercadopago-callback.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CheckoutMercadopagoCallbackComponent implements OnInit {
  order$: Observable<GetOrderByCode.OrderByCode>;
  notFound$: Observable<boolean>;
  pagos$: Observable<PagoPublicMetadata[]>;
  status$: Observable<MERCADOPAGO_STATUS_PAYMENT>;

  constructor(
    private dataService: DataService,
    private changeDetector: ChangeDetectorRef,
    private route: ActivatedRoute,
    private router: Router,
  ) {}

  ngOnInit(): void {
    this.route.queryParamMap.subscribe(paramMap => {
      if (!paramMap.has('external_reference')) {
        this.router.navigate(['/']);
      }
    });

    const orderRequest$ = this.route.queryParamMap.pipe(
      map(paramMap => paramMap.get('external_reference')),
      filter(notNullOrUndefined),
      switchMap(code =>
        this.dataService.query<GetOrderByCode.Query, GetOrderByCode.Variables>(
          GET_ORDER_BY_CODE,
          { code },
          'no-cache',
        ),
      ),
      map(data => data.orderByCode),
      shareReplay(1),
    );
    this.order$ = orderRequest$.pipe(filter(notNullOrUndefined));
    this.notFound$ = orderRequest$.pipe(
      map(res => {
        return !res;
      }),
      catchError((error: any) => {
        console.warn('error al buscar orden', error);
        return from([true]);
      }),
    );

    // @ts-ignore
    this.status$ = this.route.queryParamMap.pipe(map(params => params.get('status') || ''));

    this.pagos$ = this.order$.pipe(
      map(res => {
        return res.__typename === 'Order' ? extractPagos(res as Order) : [];
      }),
    );
  }
}
