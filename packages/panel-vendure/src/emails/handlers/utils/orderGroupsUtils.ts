/* eslint-disable @typescript-eslint/ban-ts-comment */
/* eslint-disable @typescript-eslint/no-non-null-assertion */
/* tslint:disable:no-non-null-assertion */
import { EntityHydrator, Injector, Order, RequestContext, ShippingLine } from '@vendure/core';

import { OrderGroup } from '../../../plugins/chasqui-plugin/order-group/entities/order-group.entity';
import { OrderGroupService } from '../../../plugins/chasqui-plugin/order-group/services/OrderGroupService';

export async function loadOrderGroup(
  ctx: RequestContext,
  orderGroup: OrderGroup,
  injector: Injector,
): Promise<OrderGroup | undefined> {
  const orderGroupService = injector.get(OrderGroupService);

  const og = await orderGroupService.findOneByCode(ctx, orderGroup.code);
  return og;
}

export async function loadOrders(
  ctx: RequestContext,
  orderGroup: OrderGroup,
  injector: Injector,
): Promise<Order[]> {
  const orderGroupService = injector.get(OrderGroupService);

  const paginated = await orderGroupService.ordersOfGroup(ctx, orderGroup.id, {} as any, true);

  const orders = paginated?.items || [];

  orders.forEach(order => {
    order.lines.forEach(line => {
      if (!line.productVariant.name) {
        // @ts-ignore
        line.productVariant.name = line.productVariant.translations[0].name;
      }
    });
  });
  return orders;
}

export async function hydrateShippingLine(
  ctx: RequestContext,
  orderGroup: OrderGroup | undefined,
  injector: Injector,
): Promise<ShippingLine | undefined> {
  if (!orderGroup || !orderGroup.shippingLine) {
    return;
  }

  const entityHydrator = injector.get(EntityHydrator);

  await entityHydrator.hydrate(ctx, orderGroup.shippingLine, {
    relations: ['shippingMethod'],
  });
  return orderGroup.shippingLine;
}
