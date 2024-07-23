import { Component, Input } from '@angular/core';

@Component({
  selector: 'vsf-multicatalog-card',
  templateUrl: './multicatalog-card.component.html',
  styleUrls: ['./multicatalog-card.component.scss'],
})
export class MulticatalogCardComponent {
  @Input() tienda: any;
}
