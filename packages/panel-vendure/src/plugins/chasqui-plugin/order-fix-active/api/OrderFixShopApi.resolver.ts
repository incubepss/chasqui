import { Resolver, Mutation } from '@nestjs/graphql';
import { Ctx, RequestContext } from '@vendure/core';
import { OrderFixActiveService } from '../services/OrderFixActive.service';

@Resolver()
export class OrderFixShopApiResolver {
  constructor(private orderfixActiveService: OrderFixActiveService) {}

  @Mutation()
  checkCustomerOrderActive(@Ctx() ctx: RequestContext) {
    return this.orderfixActiveService.checkCustomerOrderActive(ctx);
  }
}
