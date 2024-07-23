import { Args, Query, Resolver, Mutation } from '@nestjs/graphql';
import {
  Allow,
  Ctx,
  RequestContext,
  Transaction,
  Payment,
  ErrorResultUnion,
  SettlePaymentResult,
  Fulfillment,
} from '@vendure/core';
import {
  Permission,
  MutationSettlePaymentArgs,
  MutationAddFulfillmentToOrderArgs,
  AddFulfillmentToOrderResult,
} from '@vendure/common/lib/generated-types';

import { CustomOrderService } from '../services/CustomOrder.service';

@Resolver()
export class OrdersResolver {
  constructor(private customOrderService: CustomOrderService) {}

  @Query()
  @Allow(Permission.ReadOrder)
  async orders(@Ctx() ctx: RequestContext, @Args() { options }: any) {
    return this.customOrderService.findAll(ctx, options) || [];
  }

  @Query()
  @Allow(Permission.ReadOrder)
  async countOrdersByState(@Ctx() ctx: RequestContext, @Args() { options }: any) {
    return this.customOrderService.countByState(ctx, options) || [];
  }

  @Transaction()
  @Mutation()
  @Allow(Permission.UpdateOrder)
  async addFulfillmentToOrder(
    @Ctx() ctx: RequestContext,
    @Args() args: MutationAddFulfillmentToOrderArgs,
  ): Promise<ErrorResultUnion<AddFulfillmentToOrderResult, Fulfillment>> {
    return this.customOrderService.createFulfillment(ctx, args.input);
  }

  @Transaction()
  @Mutation()
  @Allow(Permission.UpdateOrder)
  async settlePayment(
    @Ctx() ctx: RequestContext,
    @Args() args: MutationSettlePaymentArgs,
  ): Promise<ErrorResultUnion<SettlePaymentResult, Payment>> {
    return this.customOrderService.settlePayment(ctx, args.id);
  }
}
