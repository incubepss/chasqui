import { Args, Mutation, Resolver } from '@nestjs/graphql';
import {
  ActiveOrderService,
  Allow,
  Ctx,
  ErrorResultUnion,
  OrderService,
  Permission,
  RequestContext,
  Transaction,
  Order,
} from '@vendure/core';
import { MutationAddItemToOrderArgs, UpdateOrderItemsResult } from '@vendure/common/lib/generated-shop-types';
import { OrderModificationError } from '@vendure/core/dist/common/error/generated-graphql-shop-errors';

@Resolver()
export class ShopOrderResolver {
  constructor(private orderService: OrderService, private activeOrderService: ActiveOrderService) {}

  @Transaction()
  @Mutation()
  @Allow(Permission.UpdateOrder, Permission.Owner)
  async addItemToOrder(
    @Ctx() ctx: RequestContext,
    @Args() args: MutationAddItemToOrderArgs,
  ): Promise<ErrorResultUnion<UpdateOrderItemsResult, Order>> {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    if (ctx.channel?.customFields?.storeEnabled === false) {
      return new OrderModificationError();
    }

    const order = await this.activeOrderService.getOrderFromContext(ctx, true);
    return this.orderService.addItemToOrder(
      ctx,
      order.id,
      args.productVariantId,
      args.quantity,
      (args as any).customFields,
    );
  }
}
