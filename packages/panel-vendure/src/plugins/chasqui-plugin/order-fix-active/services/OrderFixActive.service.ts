import { Injectable } from '@nestjs/common';
import {
  RequestContext,
  TransactionalConnection,
  Order,
  ActiveOrderService,
  CustomerService,
  EntityHydrator,
  OrderService,
} from '@vendure/core';

@Injectable()
export class OrderFixActiveService {
  constructor(
    private connection: TransactionalConnection,
    private activeOrderService: ActiveOrderService,
    private customerService: CustomerService,
    private orderService: OrderService,
    private entityHydratorService: EntityHydrator,
  ) {}

  async checkCustomerOrderActive(ctx: RequestContext): Promise<Order | undefined> {
    // ver orden activa
    let order = await this.activeOrderService.getOrderFromContext(ctx);
    if (!order) {
      return;
    }
    order = await this.orderService.findOne(ctx, order.id);

    // verificar que la orden tenga un usuario, sino le asigna el activo
    if (order && !order.customer?.id && ctx.activeUserId) {
      const customer = await this.customerService.findOneByUserId(ctx, ctx.activeUserId);
      if (customer) {
        order.customer = customer;
        await this.connection.getRepository(ctx, Order).save(order, { reload: false });
      }
    }
    return order;
  }
}
