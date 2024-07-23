import { Mutation, Args, Resolver, Query } from '@nestjs/graphql';
import {
  Ctx,
  RequestContext,
  TransactionalConnection,
  ListQueryBuilder,
  Allow,
  Permission,
  PaginatedList,
  Order,
  ActiveOrderService,
  ErrorResultUnion,
  EntityNotFoundError,
  Transaction,
  Fulfillment,
  ID,
} from '@vendure/core';
import { NoActiveOrderError } from '@vendure/core/dist/common/error/generated-graphql-shop-errors';
import { ActiveOrderResult } from '@vendure/common/lib/generated-shop-types';
import { AddFulfillmentToOrderResult } from '@vendure/common/lib/generated-types';
import { OrderGroup } from '../entities/order-group.entity';

import OrderGroupService from '../services/OrderGroupService';
import { CancelOrderGroupsError } from './errors';

@Resolver()
export class OrderGroupAdminResolver {
  constructor(
    private connection: TransactionalConnection,
    private listQueryBuilder: ListQueryBuilder,
    private orderGroupService: OrderGroupService,
    private activeOrderService: ActiveOrderService,
  ) {}

  @Query()
  @Allow(Permission.ReadOrder)
  async ordersGroup(@Ctx() ctx: RequestContext, @Args() args: any): Promise<PaginatedList<OrderGroup>> {
    const groups = await this.orderGroupService.findAll(ctx, args.options || undefined);
    return groups;
  }

  @Query()
  @Allow(Permission.ReadOrder)
  countOrdersGroupByState(@Ctx() ctx: RequestContext, @Args() args: any): Promise<any> {
    return this.orderGroupService.countByState(ctx, args.options || undefined);
  }

  @Query()
  @Allow(Permission.ReadOrder)
  async orderGroupByCode(@Ctx() ctx: RequestContext, @Args() args: any): Promise<OrderGroup | undefined> {
    return this.orderGroupService.findOneByCode(ctx, args.code);
  }

  //@Transaction()
  @Mutation()
  @Allow(Permission.UpdateOrder)
  async addFulfillmentToOrderGroup(
    @Ctx() ctx: RequestContext,
    @Args() args: any,
  ): Promise<ErrorResultUnion<AddFulfillmentToOrderResult, Fulfillment>> {
    return this.orderGroupService.createFulfillment(ctx, args.orderGroupId, args.input);
  }

  @Mutation()
  @Allow(Permission.UpdateOrder)
  async transitionToShipped(@Ctx() ctx: RequestContext, @Args() args: any): Promise<OrderGroup> {
    return this.orderGroupService.transitionToShipped(ctx, args.orderGroupId);
  }

  @Mutation()
  @Allow(Permission.UpdateOrder)
  async transitionToDelivered(@Ctx() ctx: RequestContext, @Args() args: any): Promise<OrderGroup> {
    return this.orderGroupService.transitionToDelivered(ctx, args.orderGroupId);
  }

  //TODO: sacar del resolver antes de mergear a develop
  @Mutation()
  @Allow(Permission.UpdateOrder)
  async transitionOrderGroup(@Ctx() ctx: RequestContext, @Args() args: any): Promise<OrderGroup> {
    return this.orderGroupService._transitionTo(ctx, args.orderGroupId, args.state);
  }

  @Mutation()
  @Allow(Permission.UpdateOrder)
  async cancelOrderGroup(
    @Ctx() ctx: RequestContext,
    @Args() args: any,
  ): Promise<ErrorResultUnion<CancelOrderGroupsError, OrderGroup>> {
    const responseCancel = await this.orderGroupService.cancelOrderGroup(ctx, args.orderGroupId);

    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    if (responseCancel.__typename) {
      return responseCancel;
    }
    return {
      __typename: 'OrderGroup',
      ...responseCancel,
    } as any;
  }
}
