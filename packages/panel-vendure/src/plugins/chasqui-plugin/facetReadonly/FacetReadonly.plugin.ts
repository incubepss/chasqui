import path from 'path';
import { PluginCommonModule, VendurePlugin } from '@vendure/core';
import { AdminUiExtension } from '@vendure/ui-devkit/compiler';
import { FacetReadonlyService } from './services/FacetReadonly.service';
import { permissionEditFacetReadonly } from './facetReadonly.permission';
import { ChannelChasquiResolver } from './resolvers/channel-chasqui.resolver';
import { FacetChasquiResolver } from './resolvers/facet-chasqui.resolver';
import { shopApiExtensions } from './api/api-extension';
import { SellosApiResolver } from './resolvers/sellos-api.resolver';

@VendurePlugin({
  imports: [PluginCommonModule],
  adminApiExtensions: {
    resolvers: [ChannelChasquiResolver, FacetChasquiResolver],
  },
  shopApiExtensions: {
    schema: shopApiExtensions,
    resolvers: [SellosApiResolver],
  },
  configuration: config => {
    config.authOptions.customPermissions.push(permissionEditFacetReadonly);
    config.customFields.Facet.push({
      name: 'shareChannelsReadonly',
      type: 'boolean',
      public: false,
      readonly: true,
      defaultValue: false,
    });
    return config;
  },
  providers: [FacetReadonlyService],
  exports: [FacetReadonlyService],
})
export class FacetReadonlyPlugin {
  static uiExtensions: AdminUiExtension = {
    extensionPath: path.join(__dirname, 'ui'),
    ngModules: [
      {
        type: 'shared' as const,
        ngModuleFileName: 'facetreadonly-ui-extension.module.ts',
        ngModuleName: 'FacetReadonlyUiExtensionModule',
      },
      {
        type: 'lazy',
        route: 'facets',
        ngModuleFileName: 'facetreadonly-ui-lazy.module.ts',
        ngModuleName: 'FacetReadonlyUiExtensionLazyModule',
      },
    ],
  };
}
