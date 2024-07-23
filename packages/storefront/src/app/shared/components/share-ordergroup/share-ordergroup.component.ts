import { Component, ChangeDetectionStrategy, Input, Injectable } from '@angular/core';

import { NotificationService } from './../../../core/providers/notification/notification.service';
import { OrderGroup } from './../../../common/generated-types';
import { DataService } from './../../../core/providers/data/data.service';
import { OrderGroupService } from './../../services/order-group.service';
import { ChannelSelectionService } from './../../services/channel-selection.service';

@Component({
  selector: 'vsf-share-ordergroup',
  templateUrl: './share-ordergroup.component.html',
  styleUrls: ['./share-ordergroup.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ShareOrdergroupComponent {
  @Input()
  orderGroup: OrderGroup;

  @Input()
  mode: 'button' | 'list-action' = 'button';

  @Input()
  secondaryText: string;

  get shareUrl(): string {
    return this.orderGroupService.getShareUrlForGroup(this.orderGroup);
  }

  shareAvailable = false;

  activeChannel = this.channelSelectionService.getSelectedChannelToken();

  constructor(
    private orderGroupService: OrderGroupService,
    private notificationService: NotificationService,
    private channelSelectionService: ChannelSelectionService,
    private dataService: DataService,
  ) {
    this.shareAvailable = !!navigator.share;

    channelSelectionService.channelToken$.subscribe(tokenUrl => {
      this.dataService.resetCache();
    });
  }

  async doShare() {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Compra en grupo · TiendasChasqui',
          text: 'Compra en grupo',
          url: this.shareUrl,
        });
      } catch (err) {
        console.warn('No se pudo compartir el link', err);
        this.doCopyToClipboard();
      }
    } else {
      this.doCopyToClipboard();
    }
  }

  doCopyToClipboard() {
    if (!navigator.clipboard) {
      this.notificationService.error('El portapapeles no está disponible');
      return;
    }

    navigator.clipboard.writeText(this.shareUrl);
    this.notificationService.success('Enlace copiado al portapapeles');
  }
}
