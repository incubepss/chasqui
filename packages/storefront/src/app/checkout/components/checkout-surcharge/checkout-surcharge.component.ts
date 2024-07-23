import { Component, OnInit, ChangeDetectionStrategy, ChangeDetectorRef, Input } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Observable } from 'rxjs';
import { catchError, filter, map, shareReplay, switchMap } from 'rxjs/operators';

import { DataService } from '../../../core/providers/data/data.service';
import { GetOrderForCheckout } from '../../../common/generated-types';
import { FIND_SURCHARGES, USE_SURCHARGE } from './checkout-surcharge.graphql';

@Component({
  selector: 'vsf-checkout-surcharge',
  templateUrl: './checkout-surcharge.component.html',
  styleUrls: ['./checkout-surcharge.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CheckoutSurchargeComponent implements OnInit {
  order: any;
  cart$: Observable<GetOrderForCheckout.ActiveOrder | null | undefined>;
  questions$: Observable<any[]>;

  constructor(
    private dataService: DataService,
    private changeDetector: ChangeDetectorRef,
    private route: ActivatedRoute,
  ) {}

  ngOnInit(): void {
    this.questions$ = this.dataService.query(FIND_SURCHARGES).pipe(map(result => result.customSurcharges));
    this.cart$ = this.route.data.pipe(
      switchMap(data => data.activeOrder as Observable<GetOrderForCheckout.ActiveOrder>),
    );

    this.cart$.subscribe(data => {
      this.order = data;
      this.changeDetector.markForCheck();
    });
  }

  changeAnswer(question: any, event: any, ...args: any) {
    const optionId = event.target.value;
    const option = question.options.find((opt: any) => opt.id === optionId);
    this.useSurchargeOption(option);
  }

  useSurchargeOption(customSurchargeOption: any) {
    if (!customSurchargeOption) {
      return;
    }

    const { id } = customSurchargeOption;

    this.dataService
      .mutate<any, any>(USE_SURCHARGE, {
        input: {
          id,
        },
      })
      // eslint-disable-next-line @typescript-eslint/no-empty-function
      .subscribe(async ({ useCustomSurchargeOptionOnOrder }) => {});
  }

  isOptionUsed(question: any, opt: any): boolean {
    if (!this.order || !opt) {
      return false;
    }

    const skuKey = `${question.id}-${opt.id}`;

    return this.order?.surcharges?.find((s: any) => s.sku === skuKey) || false;
  }
}
