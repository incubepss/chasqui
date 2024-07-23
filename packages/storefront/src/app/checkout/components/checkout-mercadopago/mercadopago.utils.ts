/* eslint-disable @typescript-eslint/naming-convention */
import { Order, Payment } from '../../../common/generated-types';
import { MetaReferencia, PagoPublicMetadata } from './mercadopago';

const _isMercadoPagoPayment = (payment: Payment) => {
  return !!payment?.metadata?.public?.public_key && !!payment?.metadata?.public?.preferenciaId;
};

export const extractReferencia = (order: Order): MetaReferencia | null => {
  if (!order) {
    return null;
  }

  const mercadopagoPayment = order?.payments?.find(_isMercadoPagoPayment);

  if (!mercadopagoPayment) {
    return null;
  }

  return {
    payment: mercadopagoPayment,
    preferenciaId: mercadopagoPayment?.metadata?.public?.preferenciaId,
    publicKey: mercadopagoPayment?.metadata?.public?.public_key,
    initPoint: mercadopagoPayment?.metadata?.public?.init_point,
  };
};

export const extractPagos = (order: Order): PagoPublicMetadata[] => {
  if (!order) {
    return [];
  }

  const mercadopagoPayment = order?.payments?.find(_isMercadoPagoPayment);

  return mercadopagoPayment?.metadata?.public?.pagos || [];
};
