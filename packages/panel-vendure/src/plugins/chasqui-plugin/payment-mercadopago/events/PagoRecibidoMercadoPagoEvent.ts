import { RequestContext, VendureEvent } from '@vendure/core';
import { PagoRecibido } from '../types';

/**
 * @description
 * This event is fired when a MercadoPago send a payment to the /mpago-webhook
 *
 * @docsCategory events
 * @docsPage Event Types
 */
export class PagoRecibidoMercadoPagoEvent extends VendureEvent {
  constructor(public ctx: RequestContext, public pago: PagoRecibido) {
    super();
  }
}
