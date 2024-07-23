import { Component, Input, ChangeDetectionStrategy } from '@angular/core';

@Component({
  selector: 'vsf-productor-card',
  templateUrl: './productor-card.component.html',
  styleUrls: ['./productor-card.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProductorCardComponent {
  @Input()
  productor: any;

  get productorPlace(): string {
    if (!this.productor) {
      return '';
    }
    const parts = [];
    if (this.productor.localidad) {
      parts.push(this.productor.localidad);
    }

    if (this.productor.provincia) {
      parts.push(this.productor.provincia);
    }

    return parts.join(', ');
  }
}
