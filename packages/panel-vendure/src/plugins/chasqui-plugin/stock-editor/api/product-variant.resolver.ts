import { Args, Query, Resolver } from '@nestjs/graphql';
import {
  Allow,
  Ctx,
  RequestContext,
  TransactionalConnection,
  Permission,
  ProductVariantService,
  PaginatedList,
  ProductVariant,
  Relations,
  RelationPaths,
  Translated,
} from '@vendure/core';

import { QueryProductVariantsArgs } from '@vendure/common/lib/generated-types';

import { CustomProductVariantService } from './../services/product-variant.service';

@Resolver()
export class ProductResolver {
  constructor(
    private connection: TransactionalConnection,
    private productVariantService: ProductVariantService,
    private customProductVariantService: CustomProductVariantService,
  ) {}

  @Query()
  @Allow(Permission.ReadCatalog, Permission.ReadProduct)
  async productVariants(
    @Ctx() ctx: RequestContext,
    @Args() args: QueryProductVariantsArgs,
    @Relations({ entity: ProductVariant, omit: ['assets'] }) relations: RelationPaths<ProductVariant>,
  ): Promise<PaginatedList<Translated<ProductVariant>>> {
    if (args.productId) {
      return this.productVariantService.getVariantsByProductId(
        ctx,
        args.productId,
        args.options || undefined,
        relations,
      );
    }

    return this.customProductVariantService.findAll(ctx, args.options || undefined);
  }
}
