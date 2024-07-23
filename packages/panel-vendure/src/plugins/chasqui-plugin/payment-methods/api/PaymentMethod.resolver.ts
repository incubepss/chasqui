import { DEFAULT_CHANNEL_CODE } from '@vendure/common/lib/shared-constants';
import { Resolver, Query, Args } from '@nestjs/graphql';
import { QueryPaymentMethodsArgs } from '@vendure/common/lib/generated-types';

import { Ctx, RequestContext, PaymentMethodService } from '@vendure/core';

@Resolver()
export class PaymentMethodResolver {
  constructor(private paymentMethodService: PaymentMethodService) {}

  @Query()
  paymentMethods(@Ctx() ctx: RequestContext, @Args() args: QueryPaymentMethodsArgs) {
    if (ctx.channel.code === DEFAULT_CHANNEL_CODE) {
      return {
        items: [],
        totalItems: 0,
      };
    }
    let options = args.options || {};
    options = {
      ...options,
      filter: {
        ...options.filter,
        enabled: { eq: true },
      },
    };

    return this.paymentMethodService.findAll(ctx, options);
  }
}
