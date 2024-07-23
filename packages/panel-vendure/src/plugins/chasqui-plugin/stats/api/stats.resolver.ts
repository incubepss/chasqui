import { Args, Query, Resolver } from '@nestjs/graphql';
import { Allow, Ctx, Permission, RequestContext } from '@vendure/core';
import { StatsService } from './../services/StatsService';

@Resolver()
export class StatsAdminApiResolver {
  constructor(private statsService: StatsService) {}

  @Query()
  @Allow(Permission.Public)
  variantsSold(@Ctx() ctx: RequestContext, @Args() args: any) {
    return this.statsService.variantsSold(ctx, args.options);
  }

  @Query()
  @Allow(Permission.ReadOrder)
  customSurchargesSold(@Ctx() ctx: RequestContext, @Args() args: any) {
    return this.statsService.customSurchargesSold(ctx, args.options);
  }

  @Query()
  @Allow(Permission.ReadOrder)
  ordersSold(@Ctx() ctx: RequestContext, @Args() args: any) {
    return this.statsService.ordersSold(ctx, args.options);
  }
}
