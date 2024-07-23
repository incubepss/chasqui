import { Args, Query, Resolver } from '@nestjs/graphql';
import { Allow, Ctx, RequestContext } from '@vendure/core';
import { Permission } from '@vendure/common/lib/generated-types';
import { OrderByProductService } from './../services/OrderByProduct.service';

@Resolver()
export class OrderByProductResolver {
  constructor(private orderbyProductService: OrderByProductService) {}

  @Query()
  @Allow(Permission.ReadOrder)
  async ordersByProduct(@Ctx() ctx: RequestContext, @Args() { input }: any) {
    return this.orderbyProductService.findAll(ctx, input) || [];
  }
}
