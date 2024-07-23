import { Order, Payment, GetOrderByCode } from '../../../common/generated-types';

/* eslint-disable @typescript-eslint/naming-convention */
export type MetaReferencia = {
  payment: Payment;
  preferenciaId: string;
  publicKey: string;
  initPoint: string;
};

export type MERCADOPAGO_STATUS_PAYMENT = 'pending' | 'approved' | 'in_process';

export type CallbackQueryParams = {
  collection_id: string;
  payment_i: string;
  status: MERCADOPAGO_STATUS_PAYMENT;
  external_reference: string;
  payment_type: string;
  merchant_order_id: string;
  preference_id: string;
  site_id: string;
};

/**
 * REF: packages/panel-vendure/src/plugins/chasqui-plugin/payment-mercadopago/methods/settledMercadoPago.ts
 */
export type PagoPublicMetadata = {
  fecha: string;
  metodo: string;
  monto: number; // pesos no centavos
  estado: string;
  estado_detallado: string;
};
