import path from 'path';
import gql from 'graphql-tag';
import { Query, Resolver } from '@nestjs/graphql';
import { PluginCommonModule, VendurePlugin, Ctx, RequestContext, Channel } from '@vendure/core';
import { AdminUiExtension } from '@vendure/ui-devkit/compiler';
import { FacetReadonlyPlugin } from './../facetReadonly/FacetReadonly.plugin';
import { MultitiendaService } from './services/multitienda.service';
import { adminApiExtensions, shopApiExtensions } from './api/api-extensions';
import { AdminResolver } from './api/admin.resolver';
import { CreatorMultitiendaService } from './services/creatormultitienda.service';

@Resolver('Channel')
export class ChannelResolver {
  constructor(private multitiendaService: MultitiendaService) {}

  @Query()
  channels(@Ctx() ctx: RequestContext): Promise<Channel[]> {
    return this.multitiendaService.findAllActive(ctx);
  }
}

@VendurePlugin({
  imports: [PluginCommonModule, FacetReadonlyPlugin],
  providers: [MultitiendaService, CreatorMultitiendaService],
  adminApiExtensions: {
    schema: adminApiExtensions,
    resolvers: [AdminResolver],
  },
  shopApiExtensions: {
    schema: shopApiExtensions,
    resolvers: [ChannelResolver],
  },
  configuration: config => {
    config.customFields.Administrator.push({
      name: 'channel',
      type: 'relation',
      entity: Channel,
      list: false,
      public: false,
      eager: false,
    });
    return config;
  },
})
export class MultitiendaPlugin {
  static uiExtensions: AdminUiExtension = {
    extensionPath: path.join(__dirname, 'ui'),
    ngModules: [
      {
        type: 'shared' as const,
        ngModuleFileName: 'multitienda-ui-extension.module.ts',
        ngModuleName: 'MultitiendaUiExtensionModule',
      },
      {
        type: 'lazy',
        route: 'crearTienda',
        ngModuleFileName: 'multitienda-ui-lazy.module.ts',
        ngModuleName: 'MultitiendaUiExtensionLazyModule',
      },
    ],
  };
}
