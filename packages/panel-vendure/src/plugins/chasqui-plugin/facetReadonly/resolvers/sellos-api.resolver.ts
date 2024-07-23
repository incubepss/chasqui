import { Resolver, Query } from '@nestjs/graphql';
import { Ctx, RequestContext } from '@vendure/core';
import { FacetReadonlyService } from '../services/FacetReadonly.service';

@Resolver()
export class SellosApiResolver {
  constructor(private facetReadonlyService: FacetReadonlyService) {}

  @Query()
  sellos(@Ctx() ctx: RequestContext) {
    return this.facetReadonlyService.getSellosFacetValues(ctx);
  }
}
