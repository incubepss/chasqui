import { Args, Resolver, Mutation } from '@nestjs/graphql';
import { Ctx, RequestContext, Transaction, EventBus } from '@vendure/core';

import { ArrepentimientoEvent } from '../events/ArrepentimientoEvent';

@Resolver()
export class ArrepentimientoResolver {
  constructor(private eventBus: EventBus) {}

  @Transaction()
  @Mutation()
  async receiveArrepentimiento(@Ctx() ctx: RequestContext, @Args() { input }: any) {
    this.eventBus.publish(new ArrepentimientoEvent(ctx, input));
    return '';
  }
}
