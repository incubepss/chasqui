import { Injectable } from '@nestjs/common';
import { ID, OrderItem, RequestContext, TransactionalConnection } from '@vendure/core';

export type VirtualOrderState = 'NUEVOS' | 'EN_PREPARACION' | 'EN_ENTREGA';

export type findAllProductOptions = {
  orderState?: VirtualOrderState;
  shippingMethodId?: ID;
  orderGroupId?: ID;
  /**
   * states de Order, pisa a orderState: VirtualOrderState
   */
  states?: string[];
};

export type GroupedOrderProduct = {
  productorId: ID;
  productorNombre: string;
  productoNombre: string;
  productoSku: string;
  cantidad: number;
  stockOnHand: number;
  stockAllocated: number;
  listPrice: number;
  subTotallistPrice: number;
};

@Injectable()
export class OrderByProductService {
  constructor(private connection: TransactionalConnection) {}

  findAll(ctx: RequestContext, options?: findAllProductOptions): Promise<Array<GroupedOrderProduct>> {
    let states: Array<string> | null = null;
    const notStates: Array<string> | null = null;
    let hasFullfilment = false;

    const shippingMethodId = options?.shippingMethodId || 0;
    const orderGroupId = options?.orderGroupId || 0;

    const channelId = ctx.channelId;

    const virtualState: VirtualOrderState = options?.orderState || 'NUEVOS';

    if (virtualState === 'NUEVOS') {
      states = ['AddingItems', 'ArrangingPayment', 'PaymentAuthorized', 'PaymentSettled'];
      hasFullfilment = false;
    } else if (virtualState === 'EN_PREPARACION') {
      states = ['WithFulfill'];
      hasFullfilment = true;
    } else if (virtualState === 'EN_ENTREGA') {
      states = ['Shipped', 'PartiallyShipped'];
      hasFullfilment = true;
    }

    if (options?.states) {
      states = options.states;
      hasFullfilment = false;
    }

    const query = this.connection.rawConnection
      .createQueryBuilder()
      .select('productor.name', 'productorNombre')
      .addSelect('productor.id', 'productorId')
      .addSelect('pvt.name', 'productoNombre')
      .addSelect('pv.sku', 'productoSku')
      .addSelect('oi.listPrice', 'listPrice')
      .addSelect('sum(oi.listPrice)', 'subTotallistPrice')
      .addSelect('count(pvt.id)', 'cantidad')
      .addSelect('pv.stockOnHand', 'stockOnHand')
      .addSelect('pv.stockAllocated', 'stockAllocated')

      .from(OrderItem, 'oi')
      .leftJoin('order_line', 'ol', 'ol.id = oi.lineId')
      .leftJoin('product_variant', 'pv', 'pv.id = ol.productVariantId')
      .leftJoin('product_variant_translation', 'pvt', "pvt.baseId = pv.id and pvt.languageCode = 'es'")
      .leftJoin('product', 'p', 'p.id = pv.productId')
      .leftJoin('productor', 'productor', 'productor.id = p.productorId')
      .innerJoin('order', 'o', 'o.id = ol.orderId');

    query.where(
      ' o.id in ' +
        query
          .subQuery()
          .select('occ.orderId')
          .from('order_channels_channel', 'occ')
          .where('occ.channelId = :channelId', { channelId })
          .getQuery(),
    );

    query.andWhere('oi.cancelled = false');

    if (states) {
      query.andWhere('o.state in (:...states) ', { states });
    }

    if (notStates) {
      query.andWhere('o.state not in (:...states) ', { states: notStates });
    }

    if (hasFullfilment) {
      query.andWhere(
        'oi.id in ' +
          query
            .subQuery()
            .select('oiff.orderItemId')
            .from('order_item_fulfillments_fulfillment', 'oiff')
            .getQuery(),
      );
    }

    if (shippingMethodId) {
      query.andWhere(
        ':shippingMethodId in ' +
          query
            .subQuery()
            .select('sl.shippingMethodId')
            .from('shipping_line', 'sl')
            .where('sl.orderId = ol.orderId')
            .getQuery(),
        { shippingMethodId },
      );
    }

    if (orderGroupId) {
      query.andWhere('o.orderGroupId = :orderGroupId ', { orderGroupId });
    }

    query
      .groupBy('pv.id')
      .addGroupBy('pv.id')
      .addGroupBy('pvt.name')
      .addGroupBy('productor.id')
      .addGroupBy('productor.name')
      .addGroupBy('oi.listPrice')

      .orderBy('productor.name')
      .addOrderBy('pvt.name');

    return query.getRawMany();
  }
}
