import path from 'path';
import { VendurePlugin, PluginCommonModule } from '@vendure/core';
import { AdminUiExtension } from '@vendure/ui-devkit/compiler';

import { CustomProductVariantService } from './services/product-variant.service';
import { ProductResolver } from './api/product-variant.resolver';
import { adminApiExtensions } from './api/api-extensions';

@VendurePlugin({
  imports: [PluginCommonModule],
  adminApiExtensions: {
    schema: adminApiExtensions,
    resolvers: [ProductResolver],
  },
  providers: [CustomProductVariantService],
})
export class StockEditorPlugin {
  static uiExtensions: AdminUiExtension = {
    extensionPath: path.join(__dirname, 'ui'),
    ngModules: [
      {
        type: 'shared' as const,
        ngModuleFileName: 'stockEditor-ui-extension.module.ts',
        ngModuleName: 'StockEditorUiExtensionModule',
      },
      {
        type: 'lazy',
        route: 'stockEditor',
        ngModuleFileName: 'stockEditor-ui-lazy.module.ts',
        ngModuleName: 'StockEditorUiLazyModule',
      },
    ],
  };
}
