import { Injectable } from '@angular/core';
import { Observable, BehaviorSubject } from 'rxjs';

import { DEFAULT_CHANNEL_TOKEN } from '../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class ChannelSelectionService {
  channelToken$: Observable<string> = new BehaviorSubject<string>('');

  getSelectedChannelToken(): string {
    return (
      sessionStorage.getItem('selectedChannelToken') ||
      localStorage.getItem('lastChannelToken') ||
      DEFAULT_CHANNEL_TOKEN
    );
  }

  setSelectedChannelToken(value: string) {
    sessionStorage.setItem('selectedChannelToken', value);
    localStorage.setItem('lastChannelToken', value);
    // borra item viejo para no dejar , borrar esta linea en futuras versiones
    localStorage.removeItem('selectedChannelToken');

    (this.channelToken$ as BehaviorSubject<string>).next(value);
  }
}
