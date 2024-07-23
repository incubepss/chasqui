import { Order, RequestContext, VendureEvent } from '@vendure/core';

/**
 * @description
 * This event is fired when a Order expires by non-used time.
 *
 * @docsCategory events
 * @docsPage Event Types
 */
export class ExpirationOrderEvent extends VendureEvent {
  constructor(public ctx: RequestContext, public order: Order) {
    super();
  }
}
