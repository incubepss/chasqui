import { Component, ChangeDetectionStrategy, Input } from '@angular/core';

@Component({
  selector: 'vsf-help-button',
  templateUrl: './help-button.component.html',
  styleUrls: ['./help-button.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HelpButtonComponent {
  @Input() icon: string;
  @Input() title: string;
  @Input() subtitle: string;
  @Input() url: string;
}
