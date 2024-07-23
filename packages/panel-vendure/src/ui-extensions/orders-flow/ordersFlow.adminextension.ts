import path from 'path';
import { AdminUiExtension } from '@vendure/ui-devkit/compiler';

export const uiExtensions: AdminUiExtension = {
  extensionPath: path.join(__dirname),
  ngModules: [
    {
      type: 'shared' as const,
      ngModuleFileName: 'ordersFlow-ui-extension.module.ts',
      ngModuleName: 'OrdersFlowUiExtensionModule',
    },
    {
      type: 'lazy',
      route: 'ordersFlow',
      ngModuleFileName: 'ordersFlow-ui-lazy.module.ts',
      ngModuleName: 'OrdersFlowUiLazyModule',
    },
  ],
};

export default {
  uiExtensions,
};
