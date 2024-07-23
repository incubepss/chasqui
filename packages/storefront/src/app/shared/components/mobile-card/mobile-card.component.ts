import { Location } from '@angular/common';
import { Component, ChangeDetectionStrategy, Input } from '@angular/core';

@Component({
  selector: 'vsf-mobile-card',
  templateUrl: './mobile-card.component.html',
  styleUrls: ['./mobile-card.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MobileCardComponent {
  @Input()
  title = '';
}
