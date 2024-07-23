/**
 * PLUGIN PARA SOBRE-ESCRIBIR PERMISOS DEL ADMIN-API PARA CONSUTAR PAISES
 */

import {
  PluginCommonModule,
  VendurePlugin,
  Country,
  CountryService,
  Ctx,
  PaginatedList,
  RequestContext,
  Translated,
} from '@vendure/core';
import { Resolver, Args, Query } from '@nestjs/graphql';
import { QueryCountriesArgs } from '@vendure/common/lib/generated-types';

@Resolver('Country')
export class CountryAdminApiResolver {
  constructor(private countryService: CountryService) {}

  @Query()
  countries(
    @Ctx() ctx: RequestContext,
    @Args() args: QueryCountriesArgs,
  ): Promise<PaginatedList<Translated<Country>>> {
    return this.countryService.findAll(ctx, args.options || undefined);
  }
}

@VendurePlugin({
  imports: [PluginCommonModule],
  adminApiExtensions: {
    resolvers: [CountryAdminApiResolver],
  },
})
export class CountryOverridePlugin {}
