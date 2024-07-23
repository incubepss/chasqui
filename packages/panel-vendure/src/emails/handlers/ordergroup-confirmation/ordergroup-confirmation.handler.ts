/* eslint-disable @typescript-eslint/ban-ts-comment */
/* eslint-disable @typescript-eslint/no-non-null-assertion */
/* tslint:disable:no-non-null-assertion */
import { EmailEventListener, HandlebarsMjmlGenerator } from '@vendure/email-plugin';
import dotenv from 'dotenv';

import { OrderGroupStateTransitionEvent } from '../../../plugins/chasqui-plugin/order-group/entities/ordergroup-state-transition-event';

import { friendlyDate } from '../utils/friendlyDate';
import { hydrateShippingLine, loadOrderGroup, loadOrders } from '../utils/orderGroupsUtils';
import mockOrderGroupConfimedEvent from './mockOrderGroupTransitionEvent';

HandlebarsMjmlGenerator;

dotenv.config();
const env = process.env;

export const orderGroupConfirmationHandler = new EmailEventListener('ordergroup-confirmation')
  .on(OrderGroupStateTransitionEvent)
  .filter(event => event.toState === 'ConfirmedByOwner' && !!event.orderGroup.customer)
  .loadData(async ({ event, injector }) => {
    const orderGroup = await loadOrderGroup(event.ctx, event.orderGroup, injector);
    const orders = await loadOrders(event.ctx, event.orderGroup, injector);
    const payments: any[] = []; // await hydratePaymentMethods(event.ctx, event.order, injector);
    const shippingLine = await hydrateShippingLine(event.ctx, orderGroup, injector);
    // @ts-ignore
    const fromAddressChannel = event.ctx.channel?.customFields?.fromAddress || '';
    return { shippingLine, payments, fromAddressChannel, orderGroup, orders };
  })
  .setRecipient(event => event.orderGroup.customer!.emailAddress)
  .setFrom(`{{ fromAddress }}`)
  .setSubject(`{{emailSubjectEnvironmentFlag}}Pedido grupal recibido #{{ order.code }}`)
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
    const orderGroup = event.data.orderGroup;

    const shippingMethod = orderGroup?.shippingMethod;

    // @ts-ignore
    const isShipping = shippingMethod?.customFields?.typeDelivery === 'shipping' || false;

    if (shippingMethod) {
      // @ts-ignore
      shippingMethod.isShowroom = shippingMethod?.customFields?.typeDelivery === 'showroom';
      // @ts-ignore
      shippingMethod.isShipping = isShipping;
    }

    const orderDateStr = friendlyDate(event.orderGroup.orderPlacedAt);

    const detalleUrl =
      (env.STOREFRONT_URL || 'http://localhost:4000') + '/micuenta/grupos/' + orderGroup?.code;

    const vars: any = {
      // @ts-ignore
      tiendaNombre: event.ctx.channel?.customFields?.nombre || event.ctx.channel?.code || 'Tiendas Chasqui',
      orderDateStr,
      order: orderGroup,
      orderGroup: orderGroup,
      orders: event.data.orders,
      shippingLine: event.data.shippingLine,
      isShipping,
      shippingMethod,
      detalleUrl,
    };

    if (event.data.fromAddressChannel) {
      vars.fromAddress = event.data.fromAddressChannel;
    }

    return vars;
  })

  .setMockEvent(mockOrderGroupConfimedEvent);
