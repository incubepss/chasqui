import { Component, OnInit, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { zip, from, Observable } from 'rxjs';
import { catchError, filter, map, shareReplay, switchMap } from 'rxjs/operators';
import { get } from 'scriptjs';

import { DataService } from '../../../core/providers/data/data.service';

import { Payment, GetOrderByCode } from '../../../common/generated-types';
import { notNullOrUndefined } from '../../../common/utils/not-null-or-undefined';
import { GET_ORDER_BY_CODE } from './checkout-mercadopago.graphql';
import { extractPagos, extractReferencia } from './mercadopago.utils';
import { PagoPublicMetadata } from './mercadopago';

@Component({
  selector: 'vsf-checkout-mercadopago',
  templateUrl: './checkout-mercadopago.component.html',
  styleUrls: ['./checkout-mercadopago.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CheckoutMercadopagoComponent implements OnInit {
  loadingLib = true;
  busy = false;
  paymentErrorMessage = '';
  order$: Observable<GetOrderByCode.OrderByCode>;
  notOrderFound$: Observable<boolean>;
  notPaymentFound = false;
  payment$: Observable<Payment>;
  pagosOnPayment: PagoPublicMetadata[] = [];
  linkInicioPago: string;

  constructor(
    private dataService: DataService,
    private changeDetector: ChangeDetectorRef,
    private route: ActivatedRoute,
  ) {}

  ngOnInit(): void {
    const libMP$ = from(
      new Promise(resolve => {
        get('https://sdk.mercadopago.com/js/v2', () => {
          //library has been loaded...
          this.loadingLib = false;
          this.changeDetector.markForCheck();
          resolve('done');
        });
      }),
    );

    const orderRequest$ = this.route.paramMap.pipe(
      map(paramMap => paramMap.get('code')),
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
    this.notOrderFound$ = orderRequest$.pipe(
      map(res => {
        return !res;
      }),
      catchError((error: any) => {
        console.warn('error al buscar orden', error);
        return from([true]);
      }),
    );

    zip(libMP$, this.order$).subscribe((result: any) => {
      const order = result[1];
      const data = extractReferencia(order);
      const pagos = extractPagos(order);

      if (!data) {
        this.notPaymentFound = true;
        this.changeDetector.markForCheck();
        return;
      }

      if (data.initPoint && !pagos.length) {
        this.linkInicioPago = data.initPoint;
        this.changeDetector.markForCheck();
      }

      if (!pagos.length && data.payment.state === 'Authorized') {
        this.createCheckoutButton(data.publicKey, data.preferenciaId);
      } else {
        this.payment$ = from([data.payment]);
        this.pagosOnPayment = pagos;
        this.changeDetector.markForCheck();
      }
    });
  }

  createCheckoutButton(publicKey: string, preferenceId: string) {
    // @ts-ignore
    const mp = new window.MercadoPago(publicKey, {
      locale: 'es-AR',
    });

    // Inicializa el checkout
    mp.checkout({
      preference: {
        id: preferenceId,
      },
      autoOpen: true,
    });
  }
}
