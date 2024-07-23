import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'vsf-checkout-stage-indicator',
  templateUrl: './checkout-stage-indicator.component.html',
  styleUrls: ['./checkout-stage-indicator.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CheckoutStageIndicatorComponent {
  @Input() signedIn = false;
  @Input() activeStage = 1;

  @Output() clickStep = new EventEmitter<number>();

  onClickStep(value: number) {
    this.clickStep.emit(value);
  }
}
