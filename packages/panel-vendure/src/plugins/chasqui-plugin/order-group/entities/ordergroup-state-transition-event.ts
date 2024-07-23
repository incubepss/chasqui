import { VendureEvent, RequestContext } from '@vendure/core';

import { OrderGroup, OrderGroupState } from './order-group.entity';

/**
 * @description
 * This event is fired whenever an {@link OrderGroup} transitions from one {@link OrderGroupState} to another.
 *
 * @docsCategory events
 * @docsPage Event Types
 */
export class OrderGroupStateTransitionEvent extends VendureEvent {
  constructor(
    public fromState: OrderGroupState,
    public toState: OrderGroupState,
    public ctx: RequestContext,
    public orderGroup: OrderGroup,
  ) {
    super();
  }
}
