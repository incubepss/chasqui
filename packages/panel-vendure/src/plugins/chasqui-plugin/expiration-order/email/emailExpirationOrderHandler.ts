import { EmailEventListener } from '@vendure/email-plugin';
import { findChannelLogo } from '../../../../emails/handlers/utils/findChannelLogo';
import { ExpirationOrderEvent } from '../events/ExpirationOrderEvent';
import { mockExpirationOrderEvent } from './mockEvent';

export const emailExpirationOrderHandler = new EmailEventListener('expiration-order')
  .on(ExpirationOrderEvent)
  .filter(event => {
    const hasCustomer = !!event.order?.customer;
    return hasCustomer;
  })
  .loadData(async ({ event, injector }) => {
    const logoUrl = await findChannelLogo(event.ctx, injector);
    return { logoUrl };
  })
  .setRecipient(event => event.order?.customer?.emailAddress || '')
  .setFrom(`{{ fromAddress }}`)
  .setSubject(`Pedido vencido por falta de actividad`)
  .setTemplateVars(event => ({
    orderCode: event.order.code,
    orderCreatedAt: event.order.createdAt,
  }))
  .setMockEvent(mockExpirationOrderEvent);
