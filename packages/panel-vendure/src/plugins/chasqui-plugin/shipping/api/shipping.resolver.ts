import { Query, Resolver, Args } from '@nestjs/graphql';
import { Ctx, RequestContext, ShippingMethodService } from '@vendure/core';

@Resolver()
export class ShippingShopApiResolver {
  constructor(private shippingService: ShippingMethodService) {}

  @Query()
  shippingMethods(@Ctx() ctx: RequestContext, @Args() args: any) {
    return this.shippingService.findAll(ctx, args?.options);
  }
}
