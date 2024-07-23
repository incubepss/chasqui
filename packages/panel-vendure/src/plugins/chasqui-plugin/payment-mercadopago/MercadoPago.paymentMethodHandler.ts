import {
  Order,
  PaymentMethodHandler,
  CreatePaymentResult,
  SettlePaymentResult,
  SettlePaymentErrorResult,
  LanguageCode,
  Logger,
} from '@vendure/core';
import mercadopago from 'mercadopago';
import { CreatePreferencePayload } from 'mercadopago/models/preferences/create-payload.model';
import { PaymentSearchResponse } from 'mercadopago/resources/payment';
import { PreferenceCreateResponse } from 'mercadopago/resources/preferences';

import { prepareMetadatadaForCreated } from './helpers/prepareMetadatadaForCreated';
import transformOrderToPreferencia from './helpers/transformOrderToPreferencia';
import settledMercadoPago from './methods/settledMercadoPago';
import { _findPaymentsForOrder } from './services/mercadoPago.service';

const env = process.env;

const _generateTransactionId = (order: Order): string => {
  const lastPart = Date.now();
  return order.code + '-' + lastPart;
};

const _generateNotificationUrl = (order: Order, transactionId: string): string => {
  //https://webhook.site/2085609c-945f-45ba-a698-db689d468005
  const url = env.MERCADOPAGO_WEBHOOK_CONTROLLER;
  if (!url) {
    Logger.warn('Missing MERCADOPAGO_WEBHOOK_CONTROLLER ENV variable', 'MercadoPagoPlugin');
  }
  return url + `?order_code=${order.code}&transaction_id=${transactionId}`;
};

/**
 * This is a handler which integrates Vendure with an imaginary
 * payment provider, who provide a Node SDK which we use to
 * interact with their APIs.
 */
export const mercadoPagoPaymentMethodHandler = new PaymentMethodHandler({
  code: 'payment-mercado-pago',
  description: [
    {
      languageCode: LanguageCode.es,
      value: 'Mercado Pago',
    },
  ],
  args: {
    public_key: { type: 'string', required: true, ui: { component: 'text-form-input' } },
    access_token: { type: 'string', required: true, ui: { component: 'text-form-input' } },
  },

  /** This is called when the `addPaymentToOrder` mutation is executed */
  createPayment: async (ctx, order, amount, args): Promise<CreatePaymentResult> => {
    try {
      if (!env.MERCADOPAGO_BACK_URL_SUCCESS) {
        Logger.warn('Missing MERCADOPAGO_BACK_URL_SUCCESS .env variable', 'MercadoPagoPlugin');
      }

      // PREPARE THE "Preferencia" of MercadoPago
      const transactionId = _generateTransactionId(order);
      const preference: CreatePreferencePayload = transformOrderToPreferencia(order);

      preference.back_urls = {
        success: env.MERCADOPAGO_BACK_URL_SUCCESS,
        pending: env.MERCADOPAGO_BACK_URL_PENDING,
        failure: env.MERCADOPAGO_BACK_URL_FAILURE,
      };
      preference.notification_url = _generateNotificationUrl(order, transactionId);

      // CALL CREATE PREFERENCIA
      mercadopago.configure({ access_token: args.access_token });
      const result: PreferenceCreateResponse = await mercadopago.preferences.create(preference);

      // PREPARE METADATA
      const metadata = prepareMetadatadaForCreated(result.body, args);

      return {
        amount: order.totalWithTax,
        state: 'Authorized' as const,
        transactionId,
        metadata,
      };
    } catch (err: any) {
      return {
        amount: order.totalWithTax,
        state: 'Declined' as const,
        metadata: {
          errorMessage: err.message,
        },
      };
    }
  },

  /** This is called when the `settlePayment` mutation is executed */
  settlePayment: async (
    ctx,
    order,
    payment,
    args,
  ): Promise<SettlePaymentResult | SettlePaymentErrorResult> => {
    let result: PaymentSearchResponse;

    try {
      result = await _findPaymentsForOrder(order, args.access_token);
    } catch (e: any) {
      const message = e.message || 'without detail';
      Logger.error('Error occurs when find payments to mercadoPago API: ', 'PaymentMercadoPago', message);
      return {
        success: false,
        state: 'Authorized',
      };
    }
    // PROCESS ORDER AND PAYMENTS
    return settledMercadoPago(order, result.body);
  },
});
