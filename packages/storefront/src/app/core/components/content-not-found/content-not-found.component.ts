import { Component, ChangeDetectionStrategy, Input } from '@angular/core';

@Component({
  selector: 'vsf-content-not-found',
  templateUrl: './content-not-found.component.html',
  styleUrls: ['./content-not-found.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ContentNotFoundComponent {
  @Input()
  message = 'No se encontró el contenido';
}
