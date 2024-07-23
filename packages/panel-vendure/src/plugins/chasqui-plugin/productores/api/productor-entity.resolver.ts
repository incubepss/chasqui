import { Args, ResolveField, Parent, Resolver } from '@nestjs/graphql';
import {
  Ctx,
  RequestContext,
  Logger,
  ProductService,
  Product,
  TransactionalConnection,
  translateDeep,
  ListQueryBuilder,
} from '@vendure/core';

import { Productor } from '../entities/productor.entity';

@Resolver('Productor')
export class ProductorEntityResolver {
  constructor(
    private connection: TransactionalConnection,
    private listQueryBuilder: ListQueryBuilder,
    private productService: ProductService,
  ) {}

  @ResolveField()
  async products(@Ctx() ctx: RequestContext, @Parent() productor: Productor, @Args() args: any) {
    return this.listQueryBuilder
      .build(Product, args?.options || {}, {
        relations: ['featuredAsset', 'assets', 'channels', 'facetValues', 'facetValues.facet'],
        channelId: ctx.channelId,
        where: {
          deletedAt: null,
        },
        ctx,
      })
      .andWhere('product.productorId = :productorId ', { productorId: productor.id })
      .andWhere('product.enabled = true ')
      .getManyAndCount()
      .then(async ([products, totalItems]) => {
        const items = products.map(product =>
          translateDeep(product, ctx.languageCode, ['facetValues', ['facetValues', 'facet']]),
        );
        return {
          items,
          totalItems,
        };
      })
      .catch((e: any) => {
        Logger.error('Error finding products of a Productor', 'ProductorPlugin', e);
      });
  }
}
