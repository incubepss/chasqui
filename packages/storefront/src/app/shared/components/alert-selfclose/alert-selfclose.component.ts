import { BehaviorSubject } from 'rxjs';
import { Component, OnInit, ChangeDetectionStrategy, Input } from '@angular/core';

@Component({
  selector: 'vsf-alert-selfclose',
  templateUrl: './alert-selfclose.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AlertSelfcloseComponent implements OnInit {
  @Input() timeout = 5000;
  @Input() type: 'success' | 'warning' = 'success';

  isShown$ = new BehaviorSubject<boolean>(true);

  isHidden$ = new BehaviorSubject<boolean>(false);

  ngOnInit(): void {
    if (this.timeout <= 0) {
      return;
    }

    setTimeout(() => {
      this.close();
    }, this.timeout);
  }

  close() {
    this.isShown$.next(false);
    //TODO: mejorar enfoque de implementación para ocultar alert
    // despues de la animacion, elimina el dom
    setTimeout(() => {
      this.isHidden$.next(true);
    }, 250);
  }
}
