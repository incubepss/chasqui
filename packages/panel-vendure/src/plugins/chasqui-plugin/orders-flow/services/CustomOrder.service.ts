import { Brackets } from 'typeorm';
import { Injectable } from '@nestjs/common';
import {
  ErrorResultUnion,
  Fulfillment,
  ID,
  isGraphQlErrorResult,
  ListQueryBuilder,
  Order,
  OrderService,
  OrderState,
  Payment,
  PaymentService,
  RequestContext,
  SettlePaymentError,
  SettlePaymentResult,
  TransactionalConnection,
} from '@vendure/core';
import { FulfillOrderInput } from '@vendure/common/lib/generated-types';
import { OrderStateMachine } from '@vendure/core/dist/service/helpers/order-state-machine/order-state-machine';

@Injectable()
export class CustomOrderService {
  constructor(
    private listQueryBuilder: ListQueryBuilder,
    private paymentService: PaymentService,
    private connection: TransactionalConnection,
    private orderService: OrderService,
    private orderStateMachine: OrderStateMachine,
  ) {}

  findAll(ctx: RequestContext, options?: any): Promise<any> {
    let shippingMethodId = '';
    let key = '';
    // let paymentMethodCode = '';

    if (options?.filter?.shippingMethodId) {
      shippingMethodId = options.filter.shippingMethodId.eq;
      delete options.filter['shippingMethodId'];
    }

    if (options?.filter?.key) {
      key = options.filter.key.eq;
      delete options.filter['key'];
    }

    const query = this.listQueryBuilder.build(Order, options, {
      ctx,
      relations: ['lines', 'customer', 'lines.productVariant', 'lines.items', 'channels', 'shippingLines'],
      channelId: ctx.channelId,
      customPropertyMap: {
        customerLastName: 'customer.lastName',
      },
    });

    // Solo trae los pedidos individuales
    // no trae los pedidos que son parte de un pedido grupal
    query.andWhere('order.orderGroupId is null');

    if (shippingMethodId) {
      query.leftJoin('order.shippingLines', 'shippingLines');
      query.andWhere('shippingLines.shippingMethodId = :shippingMethodId ', {
        shippingMethodId: shippingMethodId,
      });
    }

    if (key) {
      query.leftJoin('order.customer', 'customer');
      query.andWhere(
        new Brackets(qb => {
          key = `%${key}%`;
          qb.where('lower(customer.lastName) like lower(:key)', { key })
            .orWhere('lower(customer.firstName) like lower(:key)', { key })
            .orWhere('lower(customer.emailAddress) like lower(:key)', { key })
            .orWhere('lower(order.code) like lower(:key)', { key });
        }),
      );
    }

    return query.getManyAndCount().then(([items, totalItems]) => {
      return {
        items,
        totalItems,
      };
    });
  }

  countByState(ctx: RequestContext, options?: any): Promise<any> {
    const channelId = ctx.channelId;
    const shippingMethodId = options?.shippingMethodId || undefined;
    const code = options?.code || undefined;
    let key = options?.key || undefined;
    const orderPlacedAt = options?.orderPlacedAt || undefined;

    const query = this.connection.rawConnection
      .createQueryBuilder()
      .select('order.state', 'state')
      .addSelect('count(order.id)', 'count')
      .addSelect('sum(order.subTotalWithTax)', 'subTotalWithTax')
      .addSelect('sum(order.shippingWithTax)', 'subTotalshippingWithTax')
      .from(Order, 'order')
      .leftJoin('order_channels_channel', 'occ', 'occ.orderId = order.id');

    query.where('occ.channelId = :channelId', { channelId });

    // Solo trae los pedidos individuales
    // no trae los pedidos que son parte de un pedido grupal
    query.andWhere('order.orderGroupId is null');

    if (shippingMethodId) {
      query.leftJoin('shipping_line', 'sl', 'sl.orderId = order.id');
      query.andWhere('sl.shippingMethodId = :shippingMethodId', { shippingMethodId });
    }

    if (code) {
      query.andWhere('lower(order.code) like lower(:code)', { code: `%${code}%` });
    }

    if (key) {
      query.leftJoin('customer', 'order__customer', 'order__customer.id = order.customerId');
      query.andWhere(
        new Brackets(qb => {
          key = `%${key}%`;
          qb.where('lower(order__customer.lastName) like lower(:key)', { key })
            .orWhere('lower(order__customer.firstName) like lower(:key)', { key })
            .orWhere('lower(order__customer.emailAddress) like lower(:key)', { key })
            .orWhere('lower(order.code) like lower(:key)', { key });
        }),
      );
    }

    if (orderPlacedAt) {
      if (orderPlacedAt.before) {
        query.andWhere('order.orderPlacedAt <= :endDate', { endDate: orderPlacedAt.before });
      } else if (orderPlacedAt.after) {
        query.andWhere('order.orderPlacedAt >= :startDate', { startDate: orderPlacedAt.after });
      } else if (orderPlacedAt.between) {
        query.andWhere('order.orderPlacedAt >= :startDate', { startDate: orderPlacedAt.between.start });
        query.andWhere('order.orderPlacedAt <= :endDate', { endDate: orderPlacedAt.between.end });
      }
    }

    query.groupBy('order.state');

    return query.getRawMany();
  }

  /**
   * @description
   * Sobreescribe comportamiento de vendure, aplica el cambio del pago sin cambiar el estado de la order
   *
   * Settles a payment by invoking the {@link PaymentMethodHandler}'s `settlePayment()` method.
   */
  async settlePayment(
    ctx: RequestContext,
    paymentId: ID,
  ): Promise<ErrorResultUnion<SettlePaymentResult, Payment>> {
    const payment = await this.paymentService.settlePayment(ctx, paymentId);
    if (!isGraphQlErrorResult(payment)) {
      if (payment.state !== 'Settled') {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        return new SettlePaymentError(payment.errorMessage || '');
      }
    }
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    return payment;
  }

  /**
   * @description
   * Sobreescribe comportamiento de vendure,
   * si la order relacionada estña en estado previo a "WithFull", transiciona a ese estado.
   *
   * Settles a payment by invoking the {@link PaymentMethodHandler}'s `settlePayment()` method.
   */
  async createFulfillment(ctx: RequestContext, input: FulfillOrderInput) {
    const result = await this.orderService.createFulfillment(ctx, input);

    if (isGraphQlErrorResult(result)) {
      return result;
    }

    const orders = await this.getOrdersFromFullfillment(ctx, result);
    await Promise.all(orders.map(o => this.handleCreateFulfillmentState(ctx, o)));

    return result;
  }

  private getOrdersFromFullfillment(ctx: RequestContext, f: Fulfillment): Promise<Array<Order>> {
    const query = this.connection
      .getRepository(ctx, Order)
      .createQueryBuilder('order')
      .where(qb => {
        const subQuery = qb
          .subQuery()
          .select('distinct ol.orderId')
          .from('order_item_fulfillments_fulfillment', 'oiff')
          .leftJoin('order_item', 'oi', 'oi.id  = oiff.orderItemId')
          .leftJoin('order_line', 'ol', 'ol.id  = oi.lineId')
          .where('oiff.fulfillmentId = :fulfillmentId')
          .getQuery();
        return 'order.id IN ' + subQuery;
      });
    query.setParameter('fulfillmentId', f.id);
    return query.getMany();
  }

  private async handleCreateFulfillmentState(ctx: RequestContext, order: Order): Promise<void> {
    const nextOrderStates = this.getNextOrderStates(order);

    const transitionOrderIfStateAvailable = (state: OrderState | 'WithFulfill') => {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      return nextOrderStates.includes(state) && this.orderService.transitionToState(ctx, order.id, state);
    };

    await transitionOrderIfStateAvailable('WithFulfill');
  }

  /**
   * @description
   * Returns the next possible states that the Order may transition to.
   */
  getNextOrderStates(order: Order): ReadonlyArray<OrderState> {
    return this.orderStateMachine.getNextStates(order);
  }
}
