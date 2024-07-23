import { Injectable } from '@angular/core';
import { Observable, BehaviorSubject } from 'rxjs';
import { debounceTime, filter } from 'rxjs/operators';

/**
 * Servicio para detectar cuando un usuario se va del navegadortab y vuelve al tab
 */

@Injectable({
  providedIn: 'root',
  useExisting: true,
})
export class UserInteractionService {
  private _onBackToTab = new BehaviorSubject<void>(undefined);
  private _pauseOnBack = true;

  public onBackToTab$: Observable<void> = this._onBackToTab.pipe(
    filter(d => !this._pauseOnBack),
    debounceTime(200),
  );

  constructor() {
    window.addEventListener('focus', () => {
      this._onBackToTab.next();
    });

    window.addEventListener('visibilitychange', (e: any) => {
      if (document.visibilityState === 'visible') {
        this._onBackToTab.next();
      }
    });

    setTimeout(() => (this._pauseOnBack = false), 2000);
  }
}
