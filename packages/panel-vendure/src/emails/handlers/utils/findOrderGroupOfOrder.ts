import { Injector, RequestContext, Order } from '@vendure/core';
import { OrderGroup } from '../../../plugins/chasqui-plugin/order-group/entities/order-group.entity';
import OrderGroupService from '../../../plugins/chasqui-plugin/order-group/services/OrderGroupService';

export async function findOrderGroupOfOrder(
  ctx: RequestContext,
  injector: Injector,
  order: Order,
): Promise<OrderGroup | undefined> {
  const orderGroupService = injector.get(OrderGroupService);
  return orderGroupService.findOrderGroupOfOrder(ctx, order.id);
}
