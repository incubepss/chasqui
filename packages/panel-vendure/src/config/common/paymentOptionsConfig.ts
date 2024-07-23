import { PaymentOptions } from '@vendure/core';
import { mercadoPagoPaymentMethodHandler } from '../../plugins/chasqui-plugin/payment-mercadopago/MercadoPago.paymentMethodHandler';
import { PaymentManual } from '../../plugins/chasqui-plugin/payment-manual/PaymentManual.plugin';

const paymentOptionsConfig: PaymentOptions = {
  paymentMethodHandlers: [mercadoPagoPaymentMethodHandler, PaymentManual],
};

export default paymentOptionsConfig;
