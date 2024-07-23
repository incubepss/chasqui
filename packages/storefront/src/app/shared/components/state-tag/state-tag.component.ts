import { Component, ChangeDetectionStrategy, Input } from '@angular/core';

@Component({
  selector: 'vsf-state-tag',
  templateUrl: './state-tag.component.html',
  styleUrls: ['./state-tag.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StateTagComponent {
  @Input()
  state: string;

  // TECHDEB: refactorizar esta logica, crear nuevo estado para el pedido que pertece a un grupo
  // un "waitingTheGroup" para cuando el pedido participante está confirmado
  // ver story #72 en zentao
  @Input()
  stateGroup: string;

  @Input()
  mode: 'order' | 'orderGroup' = 'order';
}
