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

export const orderGroupConfirmationToStoreHandler = new EmailEventListener('ordergroup-confirmation-tostore')
  .on(OrderGroupStateTransitionEvent)
  // solo manda si la tienda configura su email para notificaciones
  //@ts-ignore
  .filter(event => event.toState === 'ConfirmedByOwner' && !!event.ctx.channel?.customFields?.fromAddress)
  .loadData(async ({ event, injector }) => {
    const orderGroup = await loadOrderGroup(event.ctx, event.orderGroup, injector);
    const orders = await loadOrders(event.ctx, event.orderGroup, injector);
    const payments: any[] = []; // await hydratePaymentMethods(event.ctx, event.order, injector);
    const shippingLine = await hydrateShippingLine(event.ctx, orderGroup, injector);
    return { shippingLine, payments, orderGroup, orders };
  })
  // manda email a la tienda
  // @ts-ignore
  .setRecipient(event => event.ctx.channel?.customFields?.fromAddress)
  .setFrom(`{{ fromAddress }}`)
  .setSubject(`{{emailSubjectEnvironmentFlag}}Nuevo pedido grupal de {{customerStr}} #{{ orderGroup.code }}`)
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
    const customerStr = event.orderGroup.customer?.firstName + ' ' + event.orderGroup.customer?.lastName;

    const panelUrl = (env.PANEL_URL || 'http://localhost:3000/panel') + '/extensions/ordersFlow';

    const vars: any = {
      // @ts-ignore
      tiendaNombre: event.ctx.channel?.customFields?.nombre || event.ctx.channel?.code || 'Tiendas Chasqui',
      orderDateStr,
      customerStr,
      orderGroup: orderGroup,
      orders: event.data.orders,
      shippingLine: event.data.shippingLine,
      isShipping,
      shippingMethod,
      panelUrl,
    };

    return vars;
  })

  .setMockEvent(mockOrderGroupConfimedEvent);
