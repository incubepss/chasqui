import { ActivatedRoute } from '@angular/router';
import { ChangeDetectionStrategy, Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { BehaviorSubject, combineLatest, Observable } from 'rxjs';
import { filter, map, switchMap, shareReplay } from 'rxjs/operators';

import { notNullOrUndefined } from '../../../common/utils/not-null-or-undefined';
import { OrderGroup } from '../../../common/generated-types';
import { DataService } from '../../../core/providers/data/data.service';

import { GET_ORDER_GROUP } from './account-ordergroup-remito.graphql';

@Component({
  selector: 'vsf-account-ordergroup-remito',
  templateUrl: './account-ordergroup-remito.component.html',
  styleUrls: ['./account-ordergroup-remito.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AccountOrderGroupRemitoComponent implements OnInit {
  orderGroup$: Observable<OrderGroup>;

  notFound$: Observable<boolean>;

  private refresh = new BehaviorSubject<void>(undefined);

  constructor(private dataService: DataService, private route: ActivatedRoute) {}

  ngOnInit() {
    const triggerFetch$ = combineLatest([this.route.paramMap, this.refresh]);

    this.orderGroup$ = triggerFetch$.pipe(
      map(([pm]) => pm?.get('code')),
      filter(notNullOrUndefined),
      switchMap(code => {
        return this.dataService.query<any, any>(GET_ORDER_GROUP, { code }, 'no-cache');
      }),
      map(data => data.orderGroupByCode),
      shareReplay(1),
    );

    this.notFound$ = this.orderGroup$.pipe(map(g => !g));
  }

  print() {
    window.print();
  }
}
