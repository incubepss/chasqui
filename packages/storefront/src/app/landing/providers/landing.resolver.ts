import { Injectable } from '@angular/core';
import { Resolve, RouterStateSnapshot, ActivatedRouteSnapshot } from '@angular/router';
import { Observable } from 'rxjs';
import { map, take } from 'rxjs/operators';

import { ChannelService } from '../../shared/services/channel.service';
import { Channel } from '../../common/generated-types';

@Injectable({
  providedIn: 'root',
})
export class LandingResolver implements Resolve<any> {
  constructor(private channelService: ChannelService) {}

  resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<Channel> {
    const obs = this.channelService.findAboutUsChannel();
    return obs.pipe(take(1));
  }
}
