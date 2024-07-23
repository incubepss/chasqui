import { LogicalOperator, SearchResult } from '@vendure/common/lib/generated-types';
import { UserInputError, RequestContext, Injector, ID, TransactionalConnection, Logger } from '@vendure/core';
import { Brackets, SelectQueryBuilder } from 'typeorm';

import { SearchStrategy } from '@vendure/core/dist/plugin/default-search-plugin/search-strategy/search-strategy';
import { getFieldsToSelect } from '@vendure/core/dist/plugin/default-search-plugin/search-strategy/search-strategy-common';
import {
  createCollectionIdCountMap,
  createFacetIdCountMap,
  createPlaceholderFromId,
  mapToSearchResult,
} from '@vendure/core/dist/plugin/default-search-plugin/search-strategy/search-strategy-utils';
import { SearchIndexItem } from '@vendure/core/dist/plugin/default-search-plugin/entities/search-index-item.entity';
import { PLUGIN_INIT_OPTIONS } from '@vendure/core/dist/plugin/default-search-plugin/constants';
import {
  DefaultSearchPluginInitOptions,
  SearchInput,
} from '@vendure/core/dist/plugin/default-search-plugin/types';

/**
 * A weighted fulltext search for PostgeSQL.
 */
export class ChasquiPostgresSearchStrategy implements SearchStrategy {
  private readonly minTermLength = 2;
  private connection: TransactionalConnection;
  private options: DefaultSearchPluginInitOptions;

  async init(injector: Injector) {
    this.connection = injector.get(TransactionalConnection);
    this.options = injector.get(PLUGIN_INIT_OPTIONS);
    Logger.info('Estrategia de búsqueda simplificada: inicializada', 'ChasquiPostgresSearchStrategy');
  }

  async getFacetValueIds(
    ctx: RequestContext,
    input: SearchInput,
    enabledOnly: boolean,
  ): Promise<Map<ID, number>> {
    const facetValuesQb = this.connection
      .getRepository(ctx, SearchIndexItem)
      .createQueryBuilder('si')
      .select(['"si"."productId"', 'MAX("si"."productVariantId")'])
      .addSelect(`string_agg("si"."facetValueIds",',')`, 'facetValues');

    this.applyTermAndFilters(ctx, facetValuesQb, input, true);
    if (!input.groupByProduct) {
      facetValuesQb.groupBy('"si"."productVariantId", "si"."productId"');
    }
    if (enabledOnly) {
      facetValuesQb.andWhere('"si"."enabled" = :enabled', { enabled: true });
    }
    const facetValuesResult = await facetValuesQb.getRawMany();
    return createFacetIdCountMap(facetValuesResult);
  }

  async getCollectionIds(
    ctx: RequestContext,
    input: SearchInput,
    enabledOnly: boolean,
  ): Promise<Map<ID, number>> {
    const collectionsQb = this.connection
      .getRepository(ctx, SearchIndexItem)
      .createQueryBuilder('si')
      .select(['"si"."productId"', 'MAX("si"."productVariantId")'])
      .addSelect(`string_agg("si"."collectionIds",',')`, 'collections');

    this.applyTermAndFilters(ctx, collectionsQb, input, true);
    if (!input.groupByProduct) {
      collectionsQb.groupBy('"si"."productVariantId", "si"."productId"');
    }
    if (enabledOnly) {
      collectionsQb.andWhere('"si"."enabled" = :enabled', { enabled: true });
    }
    const collectionsResult = await collectionsQb.getRawMany();
    return createCollectionIdCountMap(collectionsResult);
  }

  async getSearchResults(
    ctx: RequestContext,
    input: SearchInput,
    enabledOnly: boolean,
  ): Promise<SearchResult[]> {
    const take = input.take || 25;
    const skip = input.skip || 0;
    const sort = input.sort;
    const qb = this.connection
      .getRepository(ctx, SearchIndexItem)
      .createQueryBuilder('si')
      .select(this.createPostgresSelect(!!input.groupByProduct));
    if (input.groupByProduct) {
      qb.addSelect('MIN(price)', 'minPrice')
        .addSelect('MAX(price)', 'maxPrice')
        .addSelect('MIN("priceWithTax")', 'minPriceWithTax')
        .addSelect('MAX("priceWithTax")', 'maxPriceWithTax');
    }
    this.applyTermAndFilters(ctx, qb, input);

    if (sort) {
      if (sort.name) {
        qb.addOrderBy('"si_productName"', sort.name);
      }
      if (sort.price) {
        qb.addOrderBy('"si_price"', sort.price);
        qb.addOrderBy('"si_productId"', 'ASC');
      }
    } else {
      qb.addOrderBy('"si_price"', 'ASC');
      qb.addOrderBy('"si_productId"', 'ASC');
    }
    if (enabledOnly) {
      qb.andWhere('"si"."enabled" = :enabled', { enabled: true });
    }

    return qb
      .take(take)
      .skip(skip)
      .getRawMany()
      .then(res => res.map(r => mapToSearchResult(r, ctx.channel.currencyCode)));
  }

  async getTotalCount(ctx: RequestContext, input: SearchInput, enabledOnly: boolean): Promise<number> {
    const innerQb = this.applyTermAndFilters(
      ctx,
      this.connection
        .getRepository(ctx, SearchIndexItem)
        .createQueryBuilder('si')
        .select(this.createPostgresSelect(!!input.groupByProduct)),
      input,
    );
    if (enabledOnly) {
      innerQb.andWhere('"si"."enabled" = :enabled', { enabled: true });
    }
    const totalItemsQb = this.connection.rawConnection
      .createQueryBuilder()
      .select('COUNT(*) as total')
      .from(`(${innerQb.getQuery()})`, 'inner')
      .setParameters(innerQb.getParameters());
    return totalItemsQb.getRawOne().then(res => res.total);
  }

  private applyTermAndFilters(
    ctx: RequestContext,
    qb: SelectQueryBuilder<SearchIndexItem>,
    input: SearchInput,
    forceGroup = false,
  ): SelectQueryBuilder<SearchIndexItem> {
    const { term, facetValueFilters, facetValueIds, facetValueOperator, collectionId, collectionSlug } =
      input;

    qb.where('1 = 1');
    if (term && term.length > this.minTermLength) {
      qb.andWhere(
        new Brackets(qb1 => {
          qb1
            .where('LOWER(UNACCENT(si.sku)) like LOWER(UNACCENT(:term))')
            .orWhere('LOWER(UNACCENT(si.productName)) like LOWER(UNACCENT(:term))')
            .orWhere('LOWER(UNACCENT(si.productVariantName)) like LOWER(UNACCENT(:term))');
        }),
      ).setParameters({ term: '%' + term + '%' });
    }
    if (input.inStock != null) {
      if (input.groupByProduct) {
        qb.andWhere('si.productInStock = :inStock', { inStock: input.inStock });
      } else {
        qb.andWhere('si.inStock = :inStock', { inStock: input.inStock });
      }
    }
    if (facetValueIds?.length) {
      qb.andWhere(
        new Brackets(qb1 => {
          for (const id of facetValueIds) {
            const placeholder = createPlaceholderFromId(id);
            const clause = `:${placeholder} = ANY (string_to_array(si.facetValueIds, ','))`;
            const params = { [placeholder]: id };
            if (facetValueOperator === LogicalOperator.AND) {
              qb1.andWhere(clause, params);
            } else {
              qb1.orWhere(clause, params);
            }
          }
        }),
      );
    }
    if (facetValueFilters?.length) {
      qb.andWhere(
        new Brackets(qb1 => {
          for (const facetValueFilter of facetValueFilters) {
            qb1.andWhere(
              new Brackets(qb2 => {
                if (facetValueFilter.and && facetValueFilter.or?.length) {
                  throw new UserInputError('error.facetfilterinput-invalid-input');
                }
                if (facetValueFilter.and) {
                  const placeholder = createPlaceholderFromId(facetValueFilter.and);
                  const clause = `:${placeholder} = ANY (string_to_array(si.facetValueIds, ','))`;
                  const params = { [placeholder]: facetValueFilter.and };
                  qb2.where(clause, params);
                }
                if (facetValueFilter.or?.length) {
                  for (const id of facetValueFilter.or) {
                    const placeholder = createPlaceholderFromId(id);
                    const clause = `:${placeholder} = ANY (string_to_array(si.facetValueIds, ','))`;
                    const params = { [placeholder]: id };
                    qb2.orWhere(clause, params);
                  }
                }
              }),
            );
          }
        }),
      );
    }
    if (collectionId) {
      qb.andWhere(`:collectionId = ANY (string_to_array(si.collectionIds, ','))`, { collectionId });
    }
    if (collectionSlug) {
      qb.andWhere(`:collectionSlug = ANY (string_to_array(si.collectionSlugs, ','))`, {
        collectionSlug,
      });
    }
    qb.andWhere('si.languageCode = :languageCode', { languageCode: ctx.languageCode });
    qb.andWhere('si.channelId = :channelId', { channelId: ctx.channelId });
    if (input.groupByProduct === true) {
      qb.groupBy('si.productId');
    }
    return qb;
  }

  /**
   * When a select statement includes a GROUP BY clause,
   * then all selected columns must be aggregated. So we just apply the
   * "MIN" function in this case to all other columns than the productId.
   */
  private createPostgresSelect(groupByProduct: boolean): string {
    return getFieldsToSelect(this.options.indexStockStatus)
      .map(col => {
        const qualifiedName = `si.${col}`;
        const alias = `si_${col}`;
        if (groupByProduct && col !== 'productId') {
          if (
            col === 'facetIds' ||
            col === 'facetValueIds' ||
            col === 'collectionIds' ||
            col === 'channelIds'
          ) {
            return `string_agg(${qualifiedName}, ',') as "${alias}"`;
          } else if (col === 'enabled' || col === 'inStock' || col === 'productInStock') {
            return `bool_or(${qualifiedName}) as "${alias}"`;
          } else {
            return `MIN(${qualifiedName}) as "${alias}"`;
          }
        } else {
          return `${qualifiedName} as "${alias}"`;
        }
      })
      .join(', ');
  }
}
