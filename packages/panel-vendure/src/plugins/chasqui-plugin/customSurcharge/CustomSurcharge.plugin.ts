import path from 'path';
import { PluginCommonModule, VendurePlugin } from '@vendure/core';
import { AdminUiExtension } from '@vendure/ui-devkit/compiler';

import { CustomSurcharge } from './entites/CustomSurcharge.entity';
import { CustomSurchargeOption } from './entites/CustomSurchargeOption.entity';
import { CustomSurchargeResolver, CustomSurchargeResolverShopResolver } from './api/customSurcharge.resolver';
import { adminApiExtensions, shopApiExtensions } from './api/api-extensions';
import { CustomSurchargeService } from './services/customSurcharge.service';
import { crudCustomSurchargePermission } from './customSurcharge-permission';

@VendurePlugin({
  imports: [PluginCommonModule],
  entities: [CustomSurcharge, CustomSurchargeOption],
  adminApiExtensions: {
    schema: adminApiExtensions,
    resolvers: [CustomSurchargeResolver],
  },
  shopApiExtensions: {
    schema: shopApiExtensions,
    resolvers: [CustomSurchargeResolverShopResolver],
  },
  configuration: config => {
    config.authOptions.customPermissions.push(crudCustomSurchargePermission);
    return config;
  },
  providers: [CustomSurchargeService],
})
export class CustomSurchargePlugin {
  static uiExtensions: AdminUiExtension = {
    extensionPath: path.join(__dirname, 'ui'),
    ngModules: [
      {
        type: 'shared' as const,
        ngModuleFileName: 'customSurcharge-ui-extension.module.ts',
        ngModuleName: 'CustomSurchargeUiExtensionModule',
      },
      {
        type: 'lazy',
        route: 'customSurcharge',
        ngModuleFileName: 'customSurcharge-ui-lazy.module.ts',
        ngModuleName: 'CustomSurchargeUiExtensionLazyModule',
      },
    ],
    translations: {
      es: path.join(__dirname, 'i18n/es.json'),
    },
  };
}
