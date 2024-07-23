import { ChangeDetectionStrategy, Component, OnDestroy, OnInit, ViewContainerRef } from '@angular/core';
import { Observable, Subject } from 'rxjs';

import { DataService } from '../../../core/providers/data/data.service';
import { StateService } from '../../providers/state/state.service';

@Component({
  selector: 'vsf-sellos-menu',
  templateUrl: './sellos-menu.component.html',
  styleUrls: ['./sellos-menu.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SellosMenuComponent implements OnInit, OnDestroy {
  overlayIsOpen$ = new Subject<boolean>();
  private destroy$ = new Subject();

  sellosMenu$: Observable<any[]>;

  constructor(private dataService: DataService, private stateService: StateService) {}

  ngOnInit() {
    this.sellosMenu$ = this.stateService.select(state => state.sellosMenu);
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  onMouseEnter() {
    this.overlayIsOpen$.next(true);
  }

  close() {
    this.overlayIsOpen$.next(false);
  }
}
