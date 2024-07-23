import path from 'path';
import { PluginCommonModule, VendurePlugin } from '@vendure/core';
import { AdminUiExtension } from '@vendure/ui-devkit/compiler';

import { ProductorService } from './services/ProductorService';
import { ProductorResolver, ProductorShopResolver } from './api/productor.resolver';
import { ProductorEntityResolver } from './api/productor-entity.resolver';
import { adminApiExtensions, shopApiExtensions } from './api/api-extensions';
import { Productor } from './entities/productor.entity';

import { crudProductorPermission } from './productor-permission';

@VendurePlugin({
  imports: [PluginCommonModule],
  entities: [Productor],
  adminApiExtensions: {
    schema: adminApiExtensions,
    resolvers: [ProductorEntityResolver, ProductorResolver],
  },
  shopApiExtensions: {
    schema: shopApiExtensions,
    resolvers: [ProductorEntityResolver, ProductorShopResolver],
  },
  configuration: config => {
    config.authOptions.customPermissions.push(crudProductorPermission);
    config.customFields.Product.push({
      name: 'productor',
      type: 'relation',
      graphQLType: 'Productor',
      public: true,
      entity: Productor,
      eager: true,
    });
    return config;
  },
  providers: [ProductorService],
  exports: [ProductorService],
})
export class ProductoresPlugin {
  static uiExtensions: AdminUiExtension = {
    extensionPath: path.join(__dirname, 'ui'),
    ngModules: [
      {
        type: 'shared' as const,
        ngModuleFileName: 'productor-ui-extension.module.ts',
        ngModuleName: 'ProductorUiExtensionModule',
      },
      {
        type: 'lazy',
        route: 'productores',
        ngModuleFileName: 'productor-ui-lazy.module.ts',
        ngModuleName: 'ProductorUiExtensionLazyModule',
      },
    ],
    translations: {
      es: path.join(__dirname, 'i18n/es.json'),
    },
  };
}
