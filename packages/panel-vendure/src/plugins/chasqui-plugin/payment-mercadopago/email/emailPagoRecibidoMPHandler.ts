import { Order, TransactionalConnection } from '@vendure/core';
import { EmailEventListener } from '@vendure/email-plugin';
import { PagoRecibidoMercadoPagoEvent } from './../events/PagoRecibidoMercadoPagoEvent';
import { mockPagoMPEvent } from './mockPagoMPEvent';

const env = process.env;

export const emailPagoRecibidoMPHandler = new EmailEventListener('pago-recibido-mercadopago')
  .on(PagoRecibidoMercadoPagoEvent)
  .loadData(async context => {
    const orderId = context.event.pago.order.id;

    const order = await context.injector
      .get(TransactionalConnection)
      .getRepository(Order)
      .findOne(orderId, {
        relations: ['customer'],
      });
    return {
      order,
    };
  })
  .setRecipient(event => {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    return event.data?.order?.customer?.emailAddress || env.SUPERADMIN_EMAIL || '';
  })
  .setFrom(`{{ fromAddress }}`)
  .setSubject(`{{emailSubjectEnvironmentFlag}}Recibimos tu pago de Mercado Pago`)
  .setTemplateVars(event => ({
    orderCode: event.pago.order.code,
    paymentTransactionId: event.pago.transactionId,
    metadata: event.pago.metadata,
  }))
  .setMockEvent(mockPagoMPEvent);
