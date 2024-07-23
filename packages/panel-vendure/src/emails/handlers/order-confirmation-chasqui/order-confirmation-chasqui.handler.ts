/* eslint-disable @typescript-eslint/ban-ts-comment */
/* eslint-disable @typescript-eslint/no-non-null-assertion */
/* tslint:disable:no-non-null-assertion */
import dotenv from 'dotenv';
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

dotenv.config();

const env = process.env;

const getStroreFrontUrl = (req: any) => {
  if (env.STOREFRONT_URL) {
    return env.STOREFRONT_URL;
  }

  if (!req) {
    return '';
  }

  return req.protocol + '://' + req.hostname;
};

const getOrderGroupUrl = (ctx: any, orderGroup: any): string => {
  return getStroreFrontUrl(ctx?.req) + '/' + ctx.channel.token + '/catalogo?gcode=' + orderGroup?.code;
};

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
      Logger.error('Error al buscar metodo de pago en emailHandler', 'order-confirmation-chasqui-handler', e);
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

export const orderConfirmationChasquiHandler = new EmailEventListener('order-confirmation')
  .on(OrderStateTransitionEvent)
  .filter(
    event =>
      (event.toState === 'PaymentAuthorized' || event.toState === 'PaymentSettled') &&
      event.fromState !== 'Modifying' &&
      !!event.order.customer,
  )
  .loadData(async ({ event, injector }) => {
    const orderGroup = await findOrderGroupOfOrder(event.ctx, injector, event.order);
    const logoUrl = await findChannelLogo(event.ctx, injector);
    const payments = await hydratePaymentMethods(event.ctx, event.order, injector);
    const shippingLines = await hydrateShippingLines(event.ctx, event.order, injector);
    // @ts-ignore
    const fromAddressChannel = event.ctx.channel?.customFields?.fromAddress || '';
    return { shippingLines, payments, logoUrl, fromAddressChannel, orderGroup };
  })
  .setRecipient(event => event.order.customer!.emailAddress)
  .setFrom(`{{ fromAddress }}`)
  .setSubject(`{{emailSubjectEnvironmentFlag}}{{subject}}`)
  .setOptionalAddressFields(event => {
    const from = event.data.fromAddressChannel || '';
    if (from) {
      return {
        replyTo: from,
      };
    }
    return {};
  })
  .setTemplateVars(event => {
    const shippingMethod = event.order.shippingLines?.[0].shippingMethod;

    // @ts-ignore
    const isShipping = shippingMethod?.customFields?.typeDelivery === 'shipping' || false;
    // @ts-ignore
    shippingMethod.isShowroom = shippingMethod?.customFields?.typeDelivery === 'showroom';
    // @ts-ignore
    shippingMethod.isShipping = isShipping;

    const orderDateStr = friendlyDate(event.order.orderPlacedAt);

    const vars: any = {
      // @ts-ignore
      tiendaNombre: event.ctx.channel?.customFields?.nombre || event.ctx.channel?.code || 'Tiendas Chasqui',
      orderDateStr,
      order: event.order,
      shippingLines: event.data.shippingLines,
      isShipping,
      shippingMethod,
      payments: friendlyUserLabels(event.data.payments || event.order.payments),
      logoUrl: event.data.logoUrl,
      // @ts-ignore
      isOrderHeadOfGroup: event.order?.customFields?.isOrderHeadOfGroup === true,
      subjectGrupalStr: '',
    };

    if (event.data.orderGroup) {
      vars.orderGroup = event.data.orderGroup;
      vars.isShipping = false;
      vars.subjectGrupalStr = ' grupal';
      vars.shareGroupUrl = getOrderGroupUrl(event.ctx, event.data.orderGroup);
      delete vars.shippingMethod;
    }

    if (vars.isOrderHeadOfGroup) {
      vars.subject = `compra grupal creada #${event.data.orderGroup?.code}`;
    } else {
      vars.subject = `Pedido${vars.subjectGrupalStr} recibido #${event.order.code}`;
    }

    if (event.data.fromAddressChannel) {
      vars.fromAddress = event.data.fromAddressChannel;
    }

    return vars;
  })

  .setMockEvent(mockOrderStateTransitionEvent);
