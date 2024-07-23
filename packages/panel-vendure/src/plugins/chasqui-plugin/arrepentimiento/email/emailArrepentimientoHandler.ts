import { EmailEventListener } from '@vendure/email-plugin';
import { ArrepentimientoEvent } from './../events/ArrepentimientoEvent';
import { mockArrepentimientoEvent } from './mockEvent';

const env = process.env;

export const emailArrepentimientoHandler = new EmailEventListener('arrepentimiento')
  .on(ArrepentimientoEvent)
  .setRecipient(event => {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    return event.ctx.channel.customFields?.emailStore || env.SUPERADMIN_EMAIL;
  })
  .setFrom(`{{ fromAddress }}`)
  .setSubject(`Solicitud de arrepentimiento`)
  .setTemplateVars(event => ({
    name: event.arrepentimiento.name,
    email: event.arrepentimiento.email,
    phone: event.arrepentimiento.phone,
    description: event.arrepentimiento.description,
  }))
  .setMockEvent(mockArrepentimientoEvent);
