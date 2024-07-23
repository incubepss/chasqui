import { Brackets } from 'typeorm';
import {
  ListQueryBuilder,
  RequestContext,
  ProductVariant,
  Translated,
  ProductVariantService,
  translateDeep,
} from '@vendure/core';
import { ListQueryOptions } from '@vendure/core/dist/common/types/common-types';
import { Injectable } from '@nestjs/common';

@Injectable()
export class CustomProductVariantService {
  constructor(
    private listQueryBuilder: ListQueryBuilder,
    private productVariantService: ProductVariantService,
  ) {}

  async findAll(ctx: RequestContext, options?: ListQueryOptions<ProductVariant>) {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    const keyFilter = options?.filter?.key?.contains || '';

    if (keyFilter) {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      delete options.filter.key;
    }

    const relations = ['featuredAsset', 'taxCategory', 'channels'];
    const query = this.listQueryBuilder.build(ProductVariant, options, {
      relations,

      channelId: ctx.channelId,
      where: { deletedAt: null },
      ctx,
    });

    if (keyFilter) {
      query.leftJoin('product', 'p', 'p.id = "productvariant"."productId"');
      query.leftJoin('productor', 'productor', 'productor.id = "p"."productorId"');
      query.andWhere(
        new Brackets(q1 => {
          q1.orWhere('UNACCENT("productvariant_translations"."name") ilike UNACCENT(:term)', {
            term: `%${keyFilter}%`,
          })
            .orWhere('"productvariant"."sku" ilike :term', { term: `%${keyFilter}%` })
            .orWhere('"productor"."name" ilike :term', { term: `%${keyFilter}%` });
        }),
      );
    }

    return query.getManyAndCount().then(async ([variants, totalItems]) => {
      const items = await this.applyPricesAndTranslateVariants(ctx, variants);
      return {
        items,
        totalItems,
      };
    });
  }

  /**
   * @description
   * Given an array of ProductVariants from the database, this method will apply the correct price and tax
   * and translate each item.
   */
  private async applyPricesAndTranslateVariants(
    ctx: RequestContext,
    variants: ProductVariant[],
  ): Promise<Array<Translated<ProductVariant>>> {
    return await Promise.all(
      variants.map(async variant => {
        const variantWithPrices = await this.productVariantService.applyChannelPriceAndTax(variant, ctx);
        return translateDeep(variantWithPrices, ctx.languageCode, [
          'options',
          'facetValues',
          ['facetValues', 'facet'],
        ]);
      }),
    );
  }
}
