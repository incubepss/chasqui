/* eslint-disable @typescript-eslint/no-non-null-assertion */
/* eslint-disable @typescript-eslint/ban-ts-comment */
/* tslint:disable:no-non-null-assertion */
import {
  Injector,
  Logger,
  Order,
  OrderStateTransitionEvent,
  Payment,
  PaymentMethod,
  PaymentMethodService,
  RequestContext,
} from '@vendure/core';
import { EmailEventListener, HandlebarsMjmlGenerator, hydrateShippingLines } from '@vendure/email-plugin';

import { findChannelLogo } from '../utils/findChannelLogo';
import { findOrderGroupOfOrder } from '../utils/findOrderGroupOfOrder';
import { friendlyDate } from '../utils/friendlyDate';

import { mockOrderStateTransitionEvent } from './mockOrderStateTransitionEvent';

HandlebarsMjmlGenerator;
type PaymentWithMethod = Payment & {
  paymentMethod: PaymentMethod;
};

async function hydratePaymentMethods(
  ctx: RequestContext,
  order: Order,
  injector: Injector,
): Promise<PaymentWithMethod[]> {
  const payments: PaymentWithMethod[] = [];
  const paymentMethodService = injector.get(PaymentMethodService);

  for (const payment of order.payments || []) {
    try {
      const result = await paymentMethodService.getMethodAndOperations(ctx, payment.method);
      const paymentMethod = result.paymentMethod;
      (payment as PaymentWithMethod).paymentMethod = paymentMethod;
      payments.push(payment as PaymentWithMethod);
    } catch (e: any) {
      Logger.error('Error al buscar metodo de pago en emailHandler', 'order-confirmation-tostore', e);
    }
  }
  return payments;
}

const labelPaymentState = {
  Created: 'Creado',
  Authorized: 'Pendiente',
  Settled: 'Realizado',
  Declined: 'Rechazado',
  Error: 'con inconviente, consultar',
  Cancelled: 'cancelado',
};

function friendlyUserLabels(payments: any[]): any[] {
  payments = payments?.map(payment => {
    if (payment?.paymentMethod?.customFields?.paymentInstruction) {
      let instruction = payment.paymentMethod.customFields.paymentInstruction;
      instruction = instruction.replace(/\n/g, '<br/>');
      payment.paymentMethod.customFields.paymentInstruction = instruction;
    }
    // @ts-ignore
    payment.state = labelPaymentState[payment.state] || payment.state;

    return payment;
  });
  return payments;
}

export const orderConfirmationToStoreHandler = new EmailEventListener('order-confirmation-tostore')
  .on(OrderStateTransitionEvent)
  .filter(
    event =>
      (event.toState === 'PaymentAuthorized' || event.toState === 'PaymentSettled') &&
      event.fromState !== 'Modifying' &&
      !!event.order.customer &&
      // @ts-ignore
      (!!event.ctx.channel?.customFields?.fromAddress || event.order.customFields.isAGroupMember),
  )
  .loadData(async ({ event, injector }) => {
    const orderGroup = await findOrderGroupOfOrder(event.ctx, injector, event.order);
    const logoUrl = await findChannelLogo(event.ctx, injector);
    const payments = await hydratePaymentMethods(event.ctx, event.order, injector);
    const shippingLines = await hydrateShippingLines(event.ctx, event.order, injector);
    return { shippingLines, payments, logoUrl, orderGroup };
  })
  .setRecipient(event => {
    //Si es de un grupo se envia aviso a la persona que coordina
    if (event.data.orderGroup) {
      return event.data.orderGroup.customer.emailAddress;
    }

    // Sino es grupo se manda a la tienda
    // @ts-ignore
    return event.ctx.channel?.customFields?.fromAddress;
  })
  .setFrom(`{{ fromAddress }}`)
  .setOptionalAddressFields(event => {
    const from = event.order.customer!.emailAddress;
    if (from) {
      return {
        replyTo: from,
      };
    }
    return {};
  })
  .setSubject(
    `{{emailSubjectEnvironmentFlag}}Nuevo pedido{{subjectGrupalStr}} de {{customerStr}} #{{ order.code }}`,
  )
  .setTemplateVars(event => {
    const shippingMethod = event.order.shippingLines?.[0].shippingMethod;

    // @ts-ignore
    const isShipping = shippingMethod?.customFields?.typeDelivery === 'shipping' || false;
    // @ts-ignore
    shippingMethod.isShowroom = shippingMethod?.customFields?.typeDelivery === 'showroom';
    // @ts-ignore
    shippingMethod.isShipping = isShipping;

    const orderDateStr = friendlyDate(event.order.orderPlacedAt);

    const customerStr = event.order.customer?.firstName + ' ' + event.order.customer?.lastName;

    const vars: any = {
      // @ts-ignore
      tiendaNombre: event.ctx.channel?.customFields?.nombre || event.ctx.channel?.code || 'Tiendas Chasqui',
      customerStr,
      orderDateStr,
      order: event.order,
      shippingLines: event.data.shippingLines,
      isShipping,
      shippingMethod,
      payments: friendlyUserLabels(event.data.payments || event.order.payments),
      logoUrl: event.data.logoUrl,
    };

    if (event.data.orderGroup) {
      vars.orderGroup = event.data.orderGroup;
      vars.isShipping = false;
      vars.subjectGrupalStr = ' en tu grupo';
      delete vars.shippingMethod;
    }

    return vars;
  })

  .setMockEvent(mockOrderStateTransitionEvent);
