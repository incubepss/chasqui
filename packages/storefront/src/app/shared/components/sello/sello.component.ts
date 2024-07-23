import { Component, ChangeDetectionStrategy, Input } from '@angular/core';

@Component({
  selector: 'vsf-sello',
  templateUrl: './sello.component.html',
  styleUrls: ['./sello.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SelloComponent {
  @Input() code: string;
  @Input() facet: string;
  @Input() mode: 'icon' | '';
  @Input() size: 'sm' | '' = '';
  @Input() title: string;

  getClass(code: string, facet: string = 'sello_producto') {
    let classMode = this.mode ? `sello--${this.mode}` : 'sello--normal';
    if (this.size !== '') {
      classMode += ` sello--${this.size} `;
    }
    return /sello[_-]producto/gi.test(facet) || facet === 'sellos_productores'
      ? `sello sello-${code} ${classMode}`
      : null;
  }
}
