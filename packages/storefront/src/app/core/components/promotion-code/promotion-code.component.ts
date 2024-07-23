import { Observable } from 'rxjs';
import { Component, OnInit, ChangeDetectionStrategy, ChangeDetectorRef, Input } from '@angular/core';

import {
  ApplyCouponCodeResult,
  Mutation,
  MutationApplyCouponCodeArgs,
} from '../../../common/generated-types';
import { DataService } from '../../providers/data/data.service';
import { StateService } from './../../providers/state/state.service';
import { APPLY_PROMOTION_CODE } from './promotion-code.graphql';

@Component({
  selector: 'vsf-promotion-code',
  templateUrl: './promotion-code.component.html',
  styleUrls: ['./promotion-code.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PromotionCodeComponent implements OnInit {
  @Input()
  visible = true;

  isSignedIn$: Observable<boolean>;

  code = '';
  errorMsg = '';
  successMsg = '';

  constructor(
    private dataService: DataService,
    private changeDetector: ChangeDetectorRef,
    private stateService: StateService,
  ) {}

  ngOnInit() {
    this.isSignedIn$ = this.stateService.select(s => s.signedIn);
  }

  apply() {
    this.errorMsg = '';
    this.successMsg = '';
    this.changeDetector.markForCheck();

    const clearCode = this.code.trim();

    if (!clearCode) {
      return;
    }

    this.dataService
      .mutate<any, MutationApplyCouponCodeArgs>(APPLY_PROMOTION_CODE, {
        couponCode: clearCode,
      })
      .subscribe(
        r => {
          const result = r.applyCouponCode as ApplyCouponCodeResult;
          switch (result?.__typename) {
            case 'Order':
              this.successMsg = 'Se aplicó el código';
              this.code = '';
              break;
            case 'CouponCodeInvalidError':
              this.errorMsg = 'El código no existe, verificá si no tiene errores';
              break;
            case 'CouponCodeExpiredError':
            case 'CouponCodeLimitError':
              this.errorMsg = 'El código ya no es válido, caducó';
              break;
            default:
              this.errorMsg = 'El código no existe o ya no es válido';
          }
          this.changeDetector.markForCheck();
        },
        error => {
          this.errorMsg = 'No se pudo aplicar el código';
          this.changeDetector.markForCheck();
        },
      );
  }
}
