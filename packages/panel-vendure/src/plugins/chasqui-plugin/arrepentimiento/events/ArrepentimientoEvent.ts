import { RequestContext, VendureEvent } from '@vendure/core';
import { IArrepentimiento } from '../Arrepentimiento';

/**
 * @description
 * This event is fired when a Order expires by non-used time.
 *
 * @docsCategory events
 * @docsPage Event Types
 */
export class ArrepentimientoEvent extends VendureEvent {
  constructor(public ctx: RequestContext, public arrepentimiento: IArrepentimiento) {
    super();
  }
}
