import { Mutation, Args, Resolver, Query } from '@nestjs/graphql';
import {
  Ctx,
  RequestContext,
  Allow,
  Permission,
  Order,
  ActiveOrderService,
  ErrorResultUnion,
  CustomerService,
  isGraphQlErrorResult,
} from '@vendure/core';
import { NoActiveOrderError } from '@vendure/core/dist/common/error/generated-graphql-shop-errors';
import { ActiveOrderResult } from '@vendure/common/lib/generated-shop-types';

import { OrderGroup } from '../entities/order-group.entity';
import OrderGroupService from '../services/OrderGroupService';

import { DisabledOrderGroupsError, CancelOrderGroupsError, CancelOrderOfGroupError } from './errors';

const hasCustomerOrderGroupsEnabled = async (
  ctx: RequestContext,
  customerService: CustomerService,
): Promise<boolean> => {
  if (!ctx.session?.user?.id) {
    return false;
  }
  const customer = await customerService.findOneByUserId(ctx, ctx.session?.user.id, true);
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  return customer?.customFields?.orderGroupEnabled === true;
};

const areOrderGroupsEnabled = async (
  ctx: RequestContext,
  customerService: CustomerService,
): Promise<boolean> => {
  return (
    // techdeb: arreglar https://www.vendure.io/docs/developer-guide/customizing-models/#typescript-typings
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    ctx.channel?.customFields?.orderGroupEnabled === true ||
    (await hasCustomerOrderGroupsEnabled(ctx, customerService))
  );
};

@Resolver()
export class OrderGroupShopResolver {
  constructor(
    private orderGroupService: OrderGroupService,
    private activeOrderService: ActiveOrderService,
    private customerService: CustomerService,
  ) {}

  @Query()
  async orderGroupByCode(@Ctx() ctx: RequestContext, @Args() args: any): Promise<OrderGroup | undefined> {
    return this.orderGroupService.findOneByCode(ctx, args.code);
  }

  @Mutation()
  async createOrderGroup(
    @Ctx() ctx: RequestContext,
    @Args() args: any,
  ): Promise<ErrorResultUnion<DisabledOrderGroupsError, OrderGroup>> {
    if (!(await areOrderGroupsEnabled(ctx, this.customerService))) {
      return new DisabledOrderGroupsError();
    }

    const orderGroup = await this.orderGroupService.createOrderGroup(
      ctx,
      args.shippingMethodId,
      args.address,
    );

    return {
      __typename: 'OrderGroup',
      ...orderGroup,
    } as any;
  }

  @Mutation()
  async createOrderGroupActiveOrder(
    @Ctx() ctx: RequestContext,
  ): Promise<ErrorResultUnion<ActiveOrderResult | DisabledOrderGroupsError, OrderGroup>> {
    if (!(await areOrderGroupsEnabled(ctx, this.customerService))) {
      return new DisabledOrderGroupsError();
    }

    const sessionOrder = await this.activeOrderService.getOrderFromContext(ctx);
    if (sessionOrder) {
      const og = await this.orderGroupService.createOrderGroupByOrder(ctx, sessionOrder.id);
      return {
        __typename: 'OrderGroup',
        ...og,
      } as any;
    }
    return new NoActiveOrderError();
  }

  @Mutation()
  @Allow(Permission.Owner)
  async deactivateOrderGroupActiveOrder(
    @Ctx() ctx: RequestContext,
  ): Promise<ErrorResultUnion<ActiveOrderResult | DisabledOrderGroupsError, any>> {
    if (!(await areOrderGroupsEnabled(ctx, this.customerService))) {
      return new DisabledOrderGroupsError();
    }
    const sessionOrder = await this.activeOrderService.getOrderFromContext(ctx);
    if (sessionOrder) {
      return this.orderGroupService.deactivateOrderGroup(ctx, sessionOrder.id);
    }
    return new NoActiveOrderError();
  }

  @Mutation()
  @Allow(Permission.Owner)
  async assignActiveOrderToGroup(
    @Ctx() ctx: RequestContext,
    @Args() args: any,
  ): Promise<ErrorResultUnion<ActiveOrderResult | DisabledOrderGroupsError, Order>> {
    if (ctx.authorizedAsOwnerOnly) {
      const sessionOrder = await this.activeOrderService.getOrderFromContext(ctx, true);
      if (sessionOrder) {
        const order = await this.orderGroupService.assignOrderToGroup(
          ctx,
          sessionOrder.id,
          args.orderGroupCode,
          args.alias,
        );
        return {
          __typename: 'Order',
          ...order,
        } as any;
      }
    }
    return new NoActiveOrderError();
  }

  @Mutation()
  @Allow(Permission.Owner)
  async confirmOrderGroup(
    @Ctx() ctx: RequestContext,
    @Args() args: any,
  ): Promise<ErrorResultUnion<DisabledOrderGroupsError, OrderGroup>> {
    return this.orderGroupService.confirmOrderGroup(ctx, args.code);
  }

  @Mutation()
  @Allow(Permission.Owner)
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

  @Mutation()
  @Allow(Permission.Owner)
  async cancelOrderOfGroup(@Ctx() ctx: RequestContext, @Args() args: any): Promise<any> {
    // validar que exista grupo y pedido participante
    // validar que el logueado sea dueño del grupo
    // validar que el grupo este activo
    // aplicar cancelacion

    const orderResult = await this.orderGroupService.cancelOrderOfOrderGroup(
      ctx,
      args.input?.orderId,
      args.input?.orderGroupId,
    );

    if (isGraphQlErrorResult(orderResult)) {
      return new CancelOrderOfGroupError(orderResult.message, orderResult.errorCode);
    }

    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    if (!orderResult.__typename) {
      return {
        __typename: 'Order',
        ...orderResult,
      } as any;
    }
    return orderResult;
  }
}
