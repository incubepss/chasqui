import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { DataService } from '../../core/providers/data/data.service';
import { Channel } from '../../common/generated-types';
import { ChannelSelectionService } from './channel-selection.service';

import { GET_ACTIVE_CHANNEL, GET_ACTIVE_CHANNEL_ABOUT_US } from './channel.graphql';

@Injectable({
  providedIn: 'root',
})
export class ChannelService {
  constructor(private dataService: DataService, private channelSelectionService: ChannelSelectionService) {
    channelSelectionService.channelToken$.subscribe(tokenUrl => {
      this.dataService.resetCache();
    });
  }

  getActiveChannel(): Observable<Channel> {
    return this.dataService.query(GET_ACTIVE_CHANNEL).pipe(map(data => data.activeChannel));
  }

  findAboutUsChannel(): Observable<Channel> {
    return this.dataService.query(GET_ACTIVE_CHANNEL_ABOUT_US).pipe(map(data => data.activeChannel));
  }

  get activeChannelBaseUrl(): string {
    const baseUrl = location.origin;
    const token = this.channelSelectionService.getSelectedChannelToken();
    return baseUrl + '/' + token;
  }
}
