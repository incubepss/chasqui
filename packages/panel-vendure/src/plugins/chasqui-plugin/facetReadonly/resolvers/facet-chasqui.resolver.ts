import { Resolver, Mutation, Args } from '@nestjs/graphql';
import {
  Permission,
  MutationDeleteFacetArgs,
  MutationUpdateFacetArgs,
  DeletionResponse,
} from '@vendure/common/lib/generated-types';
import {
  Facet,
  FacetService,
  FacetValueService,
  ConfigService,
  RequestContext,
  Translated,
  Allow,
  Ctx,
  Transaction,
  ID,
} from '@vendure/core';

import { FacetResolver } from '@vendure/core/dist/api/resolvers/admin/facet.resolver';
import { permissionEditFacetReadonly } from '../facetReadonly.permission';
import { FacetReadonlyService } from './../services/FacetReadonly.service';

@Resolver('Facet')
export class FacetChasquiResolver extends FacetResolver {
  constructor(
    facetService: FacetService,
    facetValueService: FacetValueService,
    configService: ConfigService,
    private facetReandonlyService: FacetReadonlyService,
  ) {
    super(facetService, facetValueService, configService);
  }

  @Transaction()
  @Mutation()
  async updateFacet(
    @Ctx() ctx: RequestContext,
    @Args() args: MutationUpdateFacetArgs,
  ): Promise<Translated<Facet>> {
    await this.allowEditRO(ctx, args.input.id);
    return super.updateFacet(ctx, args);
  }

  @Transaction()
  @Mutation()
  @Allow(Permission.DeleteCatalog, Permission.DeleteFacet)
  async deleteFacet(
    @Ctx() ctx: RequestContext,
    @Args() args: MutationDeleteFacetArgs,
  ): Promise<DeletionResponse> {
    await this.allowEditRO(ctx, args.id);
    return super.deleteFacet(ctx, args);
  }

  protected async allowEditRO(ctx: RequestContext, facetId: ID): Promise<any> {
    // if the idFacet is RO check permissionEditFacetReadonly.Permission
    if (!(await this.facetReandonlyService.isFacetReadonly(ctx, facetId))) {
      return true;
    }

    if (!ctx.userHasPermissions([permissionEditFacetReadonly.Permission])) {
      throw new Error('Not allowed');
    }
    return true;
  }
}
