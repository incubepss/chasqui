import { Component, ChangeDetectionStrategy, Input } from '@angular/core';

import { StateService } from './../../../core/providers/state/state.service';
import { PaymentMethod } from './../../../common/generated-types';

// eslint-disable-next-line @typescript-eslint/naming-convention
type PAYMENT_METHOD_ICON_TYPE = 'banco' | 'mercadopago' | 'efectivo' | '';

const mapImg = {
  banco: '../assets/icons/transferencia.svg',
  mercadopago: '../assets/icons/mercado-pago.svg',
  efectivo: '../assets/icons/efectivo.svg',
  '': '../assets/icons/efectivo.svg',
};

const detectIconType = (stateService: StateService, pm: PaymentMethod): PAYMENT_METHOD_ICON_TYPE => {
  if (!pm) {
    return '';
  }

  const { code, name } = pm;

  if (stateService.isMercadoPagoPayment(code)) {
    return 'mercadopago';
  }

  if (code.match(/transferencia/i) || code.match(/banco/i)) {
    return 'banco';
  }

  if (code.match(/contra entrega/i) || code.match(/efectivo/i)) {
    return 'efectivo';
  }

  return '';
};

@Component({
  selector: 'vsf-icon-payment-method',
  templateUrl: './icon-payment-method.component.html',
  styleUrls: ['./icon-payment-method.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class IconPaymentMethodComponent {
  @Input() paymentMethod: PaymentMethod;

  constructor(private stateService: StateService) {}

  detectImgSrc() {
    const iconType = detectIconType(this.stateService, this.paymentMethod);
    return mapImg[iconType];
  }
}
