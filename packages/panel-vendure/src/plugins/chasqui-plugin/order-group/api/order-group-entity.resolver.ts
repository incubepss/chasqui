import { ResolveField, Args, Parent, Resolver } from '@nestjs/graphql';
import {
  Allow,
  Permission,
  Ctx,
  RequestContext,
  TransactionalConnection,
  ListQueryBuilder,
  OrderLine,
  PaginatedList,
  Fulfillment,
  Order,
} from '@vendure/core';
import { OrderGroup } from '../entities/order-group.entity';

import OrderGroupService from '../services/OrderGroupService';

@Resolver('OrderGroup')
export class OrderGroupEntityResolver {
  constructor(
    private connection: TransactionalConnection,
    private listQueryBuilder: ListQueryBuilder,
    private orderGroupService: OrderGroupService,
  ) {}

  @ResolveField()
  // @Allow(Permission.ReadOrder)
  async lines(@Ctx() ctx: RequestContext, @Parent() orderGroup: OrderGroup): Promise<Array<OrderLine>> {
    return this.orderGroupService.linesGroup(ctx, orderGroup.id);
  }

  @ResolveField()
  async orders(
    @Ctx() ctx: RequestContext,
    @Args() args: any,
    @Parent() orderGroup: OrderGroup,
  ): Promise<PaginatedList<Order>> {
    return this.orderGroupService.ordersOfGroup(ctx, orderGroup.id, args.options);
  }

  @ResolveField()
  async ordersConfirmed(
    @Ctx() ctx: RequestContext,
    @Args() args: any,
    @Parent() orderGroup: OrderGroup,
  ): Promise<PaginatedList<Order>> {
    return this.orderGroupService.ordersOfGroup(ctx, orderGroup.id, args.options, true);
  }

  @ResolveField()
  async linesGrouped(@Ctx() ctx: RequestContext, @Args() args: any, @Parent() orderGroup: OrderGroup) {
    return this.orderGroupService.linesGroupGrouped(ctx, orderGroup.id);
  }

  @ResolveField()
  async fulfillments(
    @Ctx() ctx: RequestContext,
    @Args() args: any,
    @Parent() orderGroup: OrderGroup,
  ): Promise<Fulfillment[]> {
    return this.orderGroupService.getOrderGroupFulfillments(ctx, orderGroup.id);
  }
}
