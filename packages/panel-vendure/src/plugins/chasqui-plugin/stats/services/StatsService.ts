import {
  RequestContext,
  TransactionalConnection,
  OrderItem,
  DateOperators,
  Order,
  Surcharge,
} from '@vendure/core';
import { Injectable } from '@nestjs/common';

interface VariantsSoldOption {
  filter?: {
    orderPlacedAt?: DateOperators;
  };
}

@Injectable()
export class StatsService {
  constructor(private connection: TransactionalConnection) {}

  variantsSold(ctx: RequestContext, options?: VariantsSoldOption): Promise<any> {
    const betweenOrderPlacedAt = options?.filter?.orderPlacedAt?.between;

    const query = this.connection.rawConnection
      .createQueryBuilder()
      .select('pvt.name', 'name')
      .addSelect('p.id', 'id')
      .addSelect('pv.sku', 'sku')
      .addSelect('count(oi.id)', 'count')
      .addSelect('sum(oi.listPrice)', 'amount')

      .from(OrderItem, 'oi')
      .leftJoin('order_line', 'ol', 'ol.id = oi.lineId')
      .leftJoin('order', 'o', 'o.id = ol.orderId')
      .leftJoin('order_channels_channel', 'occ', 'occ.orderId = o.id')
      .leftJoin('product_variant', 'pv', 'pv.id = ol.productVariantId')
      .leftJoin('product_variant_translation', 'pvt', "pvt.baseId = pv.id and pvt.languageCode = 'es'")
      .leftJoin('product', 'p', 'p.id = pv.productId')
      .leftJoin('productor', 'productor', 'productor.id = p.productorId')

      .where('oi.cancelled = false')
      .andWhere('occ.channelId = :channelId', { channelId: ctx.channelId })
      .andWhere('o.state not in (:...states) ', { states: ['Cancelled', 'Expired'] })

      .groupBy('pv.sku')
      .addGroupBy('pvt.name')
      .addGroupBy('p.id')

      .orderBy('count', 'DESC')
      .addOrderBy('amount', 'DESC');

    if (betweenOrderPlacedAt) {
      query.andWhere('o.orderPlacedAt BETWEEN :fromDate and :untilDate', {
        fromDate: betweenOrderPlacedAt.start,
        untilDate: betweenOrderPlacedAt.end,
      });
    }

    return query.getRawMany();
  }

  customSurchargesSold(ctx: RequestContext, options?: VariantsSoldOption): Promise<any> {
    const betweenOrderPlacedAt = options?.filter?.orderPlacedAt?.between;

    const query = this.connection.rawConnection
      .createQueryBuilder()
      .select('s.description', 'name')
      .addSelect('s.sku', 'sku')
      .addSelect('count(s.id)', 'count')
      .addSelect('sum(s.listPrice)', 'amount')

      .from(Surcharge, 's')
      .leftJoin('order', 'o', 'o.id = s.orderId')
      .leftJoin('order_channels_channel', 'occ', 'occ.orderId = o.id')

      .where('occ.channelId = :channelId', { channelId: ctx.channelId })
      .andWhere('o.state not in (:...states) ', { states: ['Cancelled', 'Expired'] })

      .groupBy('s.sku')
      .addGroupBy('s.description')

      .orderBy('count', 'DESC')
      .addOrderBy('amount', 'DESC');

    if (betweenOrderPlacedAt) {
      query.andWhere('o.orderPlacedAt BETWEEN :fromDate and :untilDate', {
        fromDate: betweenOrderPlacedAt.start,
        untilDate: betweenOrderPlacedAt.end,
      });
    }

    return query.getRawMany();
  }

  ordersSold(ctx: RequestContext, options?: VariantsSoldOption): Promise<any> {
    const betweenOrderPlacedAt = options?.filter?.orderPlacedAt?.between;

    //TECHDEBT: coalesce es de postgres, hacer dinamico para mysql según la db elegida
    const query = this.connection.rawConnection
      .createQueryBuilder()
      .select('coalesce(sum(quantity),0)', 'quantity::integer')
      .addSelect('coalesce(sum("totalWithTax"),0)', 'totalWithTax')
      .from(subQuery => {
        subQuery
          .select('o.orderGroupId')
          .addSelect('count(*)', 'quantityIndividual')
          .addSelect('sum("subTotalWithTax" + "shippingWithTax")', 'totalWithTax')
          .addSelect('CASE WHEN "orderGroupId" is NULL THEN count(*) ELSE 1 END', 'quantity')

          .from(Order, 'o')
          .leftJoin('order_channels_channel', 'occ', 'occ.orderId = o.id')

          .where('occ.channelId = :channelId', { channelId: ctx.channelId })
          .andWhere('o.state not in (:...states) ', { states: ['Cancelled', 'Expired'] })

          .groupBy('o.orderGroupId');

        if (betweenOrderPlacedAt) {
          subQuery.andWhere('o.orderPlacedAt BETWEEN :fromDate and :untilDate', {
            fromDate: betweenOrderPlacedAt.start,
            untilDate: betweenOrderPlacedAt.end,
          });
        }

        return subQuery;
      }, 'subQuery');

    return query.getRawOne();
  }
}
