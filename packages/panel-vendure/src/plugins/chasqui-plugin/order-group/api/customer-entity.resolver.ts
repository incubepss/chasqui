import { ResolveField, Args, Parent, Resolver } from '@nestjs/graphql';
import {
  Allow,
  Permission,
  Ctx,
  RequestContext,
  TransactionalConnection,
  ListQueryBuilder,
  PaginatedList,
  Customer,
} from '@vendure/core';
import { OrderGroup } from '../entities/order-group.entity';

import OrderGroupService from '../services/OrderGroupService';

@Resolver('Customer')
export class CustomerEntityResolver {
  constructor(
    private connection: TransactionalConnection,
    private listQueryBuilder: ListQueryBuilder,
    private orderGroupService: OrderGroupService,
  ) {}

  @ResolveField()
  @Allow(Permission.Owner)
  async ordersGroup(
    @Ctx() ctx: RequestContext,
    @Args() args: any,
    @Parent() customer: Customer,
  ): Promise<PaginatedList<OrderGroup>> {
    const opts = {
      ...(args.options || {}),
      filter: {
        ...(args.options?.filter || {}),
        customerId: { eq: customer.id },
      },
    };

    return this.orderGroupService.findAll(ctx, opts);
  }
}
