import { Location } from '@angular/common';
import { Component, ChangeDetectionStrategy, Input } from '@angular/core';

@Component({
  selector: 'vsf-mobile-list-action',
  templateUrl: './mobile-list-action.component.html',
  styleUrls: ['./mobile-list-action.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MobileListActionComponent {
  @Input()
  label = '';

  @Input()
  secondaryText = '';

  @Input()
  icon = '';
}
