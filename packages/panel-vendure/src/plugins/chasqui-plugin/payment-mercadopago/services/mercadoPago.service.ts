import { Injectable } from '@nestjs/common';
import { Payment, Order, OrderService, RequestContext, Logger, EventBus } from '@vendure/core';
import mercadopago from 'mercadopago';
import { PaymentSearchResponse } from 'mercadopago/resources/payment';

import { PagoRecibido } from '../types';
import { PagoRecibidoMercadoPagoEvent } from './../events/PagoRecibidoMercadoPagoEvent';

export const _findPaymentsForOrder = (order: Order, access_token: string): Promise<PaymentSearchResponse> => {
  mercadopago.configure({
    access_token: access_token,
  });

  return mercadopago.payment.search({
    qs: { external_reference: order.code },
  });
};

@Injectable()
export class MercadoPagoService {
  constructor(private orderService: OrderService, private eventBus: EventBus) {}

  /**
   * Find MercadoPago payments for an Order
   */
  findPaymentsForOrder(order: Order, access_token: string): Promise<PaymentSearchResponse> {
    return _findPaymentsForOrder(order, access_token);
  }

  /**
   * This handle a webook the mercadopago "payment" event type
   * Find the vendure payment of the order and execute the settled process
   */
  async checkPaymentsToSettle(
    ctx: RequestContext,
    mercadopagoPaymentId: string,
    orderCode: string,
    transactionId: string,
  ): Promise<any> {
    // buscar pagos

    // buscar orden para ese pago
    const payment = await this._findPayment(ctx, orderCode, transactionId);
    if (!payment) {
      Logger.warn(
        `Vendure Payment not found for Order Code (${orderCode}) and transactionId (${transactionId})`,
        'MercadoPagoPlugin',
      );
      return;
    }

    // ejecutar setttled para ese pago
    const result = await this.orderService.settlePayment(ctx, payment.id);

    if (result instanceof Payment) {
      this.eventBus.publish(new PagoRecibidoMercadoPagoEvent(ctx, result as PagoRecibido));
    } else {
      Logger.warn(
        `hook MercadoPago > checkPaymentsToSettle > el resultado del settle no es un pago (paymentId: ${payment.id})`,
        'MercadoPagoPlugin',
      );
    }

    return result;
  }

  private async _findPayment(
    ctx: RequestContext,
    orderCode: string,
    transactionId: string,
  ): Promise<Payment | undefined> {
    const order: Order | undefined = await this.orderService.findOneByCode(ctx, orderCode);
    if (!order) {
      Logger.warn('Order not found for code ' + orderCode, 'MercadoPagoPlugin');
      return;
    }
    const payments: Array<Payment> = await this.orderService.getOrderPayments(ctx, order.id);
    return payments.find(p => p.transactionId === transactionId);
  }
}
