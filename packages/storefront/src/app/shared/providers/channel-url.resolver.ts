import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Resolve, RouterStateSnapshot } from '@angular/router';
import { Observable, of } from 'rxjs';
import { ChannelSelectionService } from './../services/channel-selection.service';

@Injectable({ providedIn: 'root' })
export class ChannelUrlResolver implements Resolve<Observable<string>> {
  constructor(private channelSelectionService: ChannelSelectionService) {}

  resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<string> {
    const channelCode: string = route.paramMap.get('channelcode') || '';
    this.channelSelectionService.setSelectedChannelToken(channelCode);

    return of(channelCode);
  }
}
