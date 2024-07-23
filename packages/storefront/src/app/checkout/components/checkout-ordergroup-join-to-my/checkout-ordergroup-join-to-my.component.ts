import {
  Component,
  ChangeDetectionStrategy,
  Output,
  EventEmitter,
  ChangeDetectorRef,
  OnInit,
} from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { ActivatedRoute } from '@angular/router';
import { Order, OrderGroup } from '../../../common/generated-types';
import { OrderGroupService } from '../../../shared/services/order-group.service';
import { NotificationService } from '../../../core/providers/notification/notification.service';

@Component({
  selector: 'vsf-checkout-ordergroup-join-to-my',
  templateUrl: './checkout-ordergroup-join-to-my.component.html',
  styleUrls: ['./checkout-ordergroup-join-to-my.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CheckoutOrdergroupJoinToMyComponent implements OnInit {
  @Output()
  joined = new EventEmitter<OrderGroup>();

  codeOrderGroup = '';

  activeOrderGroups$: Observable<OrderGroup[]>;
  notFound$: Observable<boolean>;
  isSameChannel$: Observable<boolean>;

  errorMsg = '';

  constructor(
    private orderGroupService: OrderGroupService,
    private route: ActivatedRoute,
    private changeDetector: ChangeDetectorRef,
    private notificationService: NotificationService,
  ) {}

  ngOnInit() {
    this.activeOrderGroups$ = this.route.data.pipe(map(data => data.activeOrderGroups as OrderGroup[]));
  }

  async confirmJoin(orderGroup: OrderGroup) {
    try {
      this.errorMsg = '';
      this.changeDetector.markForCheck();
      const result = await this.orderGroupService.assignActiveOrderToGroup(orderGroup.code);

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
