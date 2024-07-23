import { Order, SettlePaymentResult, SettlePaymentErrorResult } from '@vendure/core';

import translatorTermMP from '../helpers/translatorTermMP';
import { PaymentMercadoPago, ResultMercadoPago } from '../types';

/**
 * Extract and transform data to populate the "metadata" field on the Vendure Order
 */
export const _extractPaymentData = (payment: PaymentMercadoPago): any => {
  if (!payment) {
    return null;
  }

  const status = translatorTermMP(payment.status);
  const status_detail = translatorTermMP(payment.status_detail);
  const payment_type_id = translatorTermMP(payment.payment_type_id);

  return {
    id: payment.id,
    tipo_pago: payment_type_id,
    metodo_pago: payment.payment_method_id,
    estado: status,
    estado_detallado: status_detail,
    pagador: payment.payer,
    orden: payment.order,
    fecha_aprobado: payment.date_approved,
    fecha_ultimo_cambio: payment.date_last_updated,
    monto_transaccion: payment.transaction_amount,
    moneda_id: payment.currency_id,
    public: {
      fecha: payment.date_last_updated,
      metodo: payment.payment_method_id,
      monto: payment.transaction_amount,
      estado: status,
      estado_detallado: status_detail,
    },
  };
};

/**
 * Check if the payments cover the order.
 * Returns true if the order is covered
 * returns a string as an error detail
 */
export const _checkCoveredOrderPayments = (order: Order, payments: ResultMercadoPago): true | string => {
  const paymentsApproved: Array<PaymentMercadoPago> =
    payments.results?.filter((paymentMP: PaymentMercadoPago) => {
      return paymentMP.status === 'approved' && paymentMP.status_detail === 'accredited';
    }) || [];

  const totalAmount: number = paymentsApproved.reduce(
    (partialSum, payment) => partialSum + payment.transaction_amount,
    0,
  );

  const useAnotherMoney = paymentsApproved.some(payment => payment.currency_id !== order.currencyCode);

  if (useAnotherMoney && totalAmount > 0) {
    return 'Pago con otra moneda';
  } else if (totalAmount * 100 >= order.totalWithTax) {
    // vendure Order total is on cent, must be have same unit
    return true;
  } else if (totalAmount === 0) {
    return 'Sin pagos aprobados';
  } else {
    return 'El pago aprobado no cubre el monto total del pedido';
  }
};

const settledMercadoPago = (
  order: Order,
  payments: ResultMercadoPago,
): SettlePaymentResult | SettlePaymentErrorResult => {
  const countPayments = payments?.results?.length || 0;

  // CASE WITHOUT PAYMENTS
  if (countPayments < 1) {
    return {
      success: false,
      state: 'Authorized',
      errorMessage: 'No hay pagos realizados',
    };
  }

  const pagosMetadata = payments.results?.map(_extractPaymentData) || [];
  const publicMetadata = pagosMetadata.map(pago => pago.public);
  const privateMetadata = pagosMetadata.map(pago => {
    delete pago.public;
    return pago;
  });

  // extract payments metadata
  const metadata = {
    public: {
      pagos: publicMetadata,
    },
    pagos: privateMetadata,
  };

  // CHECK PAYMENTS
  const resultCovered = _checkCoveredOrderPayments(order, payments);

  if (resultCovered === true) {
    return {
      success: true,
      metadata,
    };
  } else {
    return {
      success: false,
      state: 'Authorized',
      errorMessage: resultCovered,
      metadata,
    };
  }
};

export default settledMercadoPago;
