import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { merge, Observable } from 'rxjs';
import { filter, map, mapTo, shareReplay, switchMap, tap } from 'rxjs/operators';

import { GetOrderByCode } from '../../../common/generated-types';
import { notNullOrUndefined } from '../../../common/utils/not-null-or-undefined';
import { DataService } from '../../../core/providers/data/data.service';
import { StateService } from '../../../core/providers/state/state.service';

import { GET_ORDER_BY_CODE } from './checkout-thanks.graphql';

@Component({
  selector: 'vsf-checkout-thanks',
  templateUrl: './checkout-thanks.component.html',
  styleUrls: ['./checkout-thanks.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CheckoutThanksComponent implements OnInit {
  order$: Observable<GetOrderByCode.OrderByCode | undefined>;
  notFound$: Observable<boolean>;
  loading$: Observable<boolean>;

  constructor(
    private stateService: StateService,
    private dataService: DataService,
    private changeDetector: ChangeDetectorRef,
    private route: ActivatedRoute,
  ) {}

  ngOnInit() {
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
    this.order$ = orderRequest$;
    this.notFound$ = orderRequest$.pipe(map(res => !res));

    this.loading$ = merge(orderRequest$.pipe(mapTo(true)), orderRequest$.pipe(mapTo(false)));
  }
}
