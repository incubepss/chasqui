import { Input, Component, ChangeDetectionStrategy } from '@angular/core';

@Component({
  selector: 'chq-count-badge',
  templateUrl: './count-badge.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CountBadgeComponent {
  @Input() value: number;
}
