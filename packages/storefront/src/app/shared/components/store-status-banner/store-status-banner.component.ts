import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { Observable } from 'rxjs';
import { Channel } from '../../../common/generated-types';
import { ChannelService } from '../../services/channel.service';
import { StateService } from './../../../core/providers/state/state.service';
import { CartManager } from './../../../shared/services/cart.manager';

@Component({
  selector: 'vsf-store-status-banner',
  templateUrl: './store-status-banner.component.html',
  styleUrls: ['./store-status-banner.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StoreStatusBannerComponent implements OnInit {
  channel$: Observable<Channel | null>;
  addToCartAllowed$: Observable<boolean>;

  constructor(
    private channelService: ChannelService,
    private stateService: StateService,
    private cartManager: CartManager,
  ) {}

  ngOnInit(): void {
    this.channel$ = this.stateService.select(state => state.activeChannel);
    this.addToCartAllowed$ = this.cartManager.addToCartAllowed$;
  }
}
