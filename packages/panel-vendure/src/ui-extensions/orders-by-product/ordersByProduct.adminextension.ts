import path from 'path';
import { AdminUiExtension } from '@vendure/ui-devkit/compiler';

export const uiExtensions: AdminUiExtension = {
  extensionPath: path.join(__dirname),
  ngModules: [
    {
      type: 'shared' as const,
      ngModuleFileName: 'orderbyProduct-ui-extension.module.ts',
      ngModuleName: 'OrderByProductUiExtensionModule',
    },
    {
      type: 'lazy',
      route: 'ordersByProduct',
      ngModuleFileName: 'orderbyProduct-ui-lazy.module.ts',
      ngModuleName: 'OrderbyProductUiLazyModule',
    },
  ],
};

export default {
  uiExtensions,
};
