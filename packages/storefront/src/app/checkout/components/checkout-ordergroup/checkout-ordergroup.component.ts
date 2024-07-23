import { map, switchMap } from 'rxjs/operators';
import { BehaviorSubject, Observable } from 'rxjs';
import { Component, OnInit, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import { GetOrderForCheckout } from '../../../common/generated-types';
import { OrderGroupService } from './../../../shared/services/order-group.service';
import { StateService } from './../../../core/providers/state/state.service';
import { ChannelService } from './../../../shared/services/channel.service';
import { NotificationService } from './../../../core/providers/notification/notification.service';
import { CheckoutOrderGroupService } from './../../providers/checkout.orderGroup.service';

@Component({
  selector: 'vsf-checkout-ordergroup',
  templateUrl: './checkout-ordergroup.component.html',
  styleUrls: ['./checkout-ordergroup.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CheckoutOrdergroupComponent implements OnInit {
  constructor(
    private checkoutOrderGroupService: CheckoutOrderGroupService,
    private route: ActivatedRoute,
    private changeDetector: ChangeDetectorRef,
    private notificationService: NotificationService,
    private channelService: ChannelService,
    private stateService: StateService,
    private orderGroupService: OrderGroupService,
  ) {}

  orderGroup: any;

  loading$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  isSignedIn$: Observable<boolean>;

  ngOnInit(): void {
    this.route.data
      .pipe(
        switchMap(data => data.activeOrder as Observable<GetOrderForCheckout.ActiveOrder>),
        //@ts-ignore
        map(cart => cart?.customFields?.orderGroup),
      )
      .subscribe(og => {
        this.orderGroup = og;
      });

    this.isSignedIn$ = this.stateService.select(state => state.signedIn);
  }

  activateGroup() {
    this.loading$.next(true);
    this.checkoutOrderGroupService
      .activateOrderGroup()
      .then(group => {
        if (group.__typename === 'DisabledOrderGroupsError') {
          this.notificationService.error(
            'Los pedidos en grupo, están deshabilitados actualmente en la tienda',
            '¡uy!',
          );
          return;
        }
        this.orderGroup = group;
        this.changeDetector.markForCheck();
      })
      .finally(() => {
        this.loading$.next(false);
      });
  }

  deactivateGroup() {
    this.loading$.next(true);
    this.checkoutOrderGroupService
      .deactivateOrderGroup()
      .then(order => {
        this.clearClipboard();
        this.orderGroup = order.customFields?.orderGroup;
        this.changeDetector.markForCheck();
      })
      .finally(() => {
        this.loading$.next(false);
      });
  }

  get shareUrl(): string {
    return this.orderGroupService.getShareUrlForGroup(this.orderGroup);
  }

  copyShareLinkToClipboard() {
    if (!navigator.clipboard) {
      this.notificationService.error('El portapapeles no está disponible');
      return;
    }

    navigator.clipboard.writeText(this.shareUrl);
    this.notificationService.success('Enlace copiado al portapapeles');
  }

  clearClipboard() {
    if (!navigator.clipboard) {
      return;
    }

    navigator.clipboard.writeText(this.shareUrl);
  }
}
