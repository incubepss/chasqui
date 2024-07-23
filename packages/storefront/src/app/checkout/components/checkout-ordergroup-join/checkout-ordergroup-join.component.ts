import { Component, ChangeDetectionStrategy, Output, EventEmitter, ChangeDetectorRef } from '@angular/core';
import { Observable, combineLatest } from 'rxjs';
import { map } from 'rxjs/operators';

import { Order, OrderGroup } from '../../../common/generated-types';
import { StateService } from './../../../core/providers/state/state.service';
import { OrderGroupService } from './../../../shared/services/order-group.service';
import { NotificationService } from './../../../core/providers/notification/notification.service';

const preprocessCode = (code: string): string => {
  if (!code) {
    return code;
  }

  code = code.trim();

  const codes = code.split('/grupo/');
  if (codes.length > 1) {
    code = codes[1];
  }
  return code.trim();
};

@Component({
  selector: 'vsf-checkout-ordergroup-join',
  templateUrl: './checkout-ordergroup-join.component.html',
  styleUrls: ['./checkout-ordergroup-join.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CheckoutOrdergroupJoinComponent {
  @Output()
  joined = new EventEmitter<OrderGroup>();

  codeOrderGroup = '';

  orderGroup$: Observable<OrderGroup | null>;
  notFound$: Observable<boolean>;
  isSameChannel$: Observable<boolean>;

  errorMsg = '';

  constructor(
    private orderGroupService: OrderGroupService,
    private stateService: StateService,
    private changeDetector: ChangeDetectorRef,
    private notificationService: NotificationService,
  ) {}

  async searchGroup() {
    // buscar grupo y mostrar info
    this.orderGroup$ = this.orderGroupService
      .findByCode(preprocessCode(this.codeOrderGroup))
      .pipe(map(data => data.orderGroupByCode));

    const activeChannel$ = this.stateService.select(state => state.activeChannel);

    this.isSameChannel$ = combineLatest([activeChannel$, this.orderGroup$]).pipe(
      map(([activeChannel, orderGroup]) => {
        return activeChannel?.id === orderGroup?.channel?.id;
      }),
    );

    this.notFound$ = this.orderGroup$.pipe(map(r => r === null));
  }

  async confirmJoin() {
    try {
      this.errorMsg = '';
      this.changeDetector.markForCheck();
      const result = await this.orderGroupService.assignActiveOrderToGroup(
        preprocessCode(this.codeOrderGroup),
      );

      if ((result as any).__typename === 'DisabledOrderGroupsError') {
        this.notificationService.error(
          'Los pedidos en grupo, están deshabilitados actualmente en la tienda',
          '¡uy!',
        );
        return;
      }

      if (result) {
        this.joined.emit((result as Order).customFields?.orderGroup);
      }
    } catch (e) {
      this.errorMsg = 'No se pudo sumar tu pedido al grupo';
      this.changeDetector.markForCheck();
    }
  }
}
