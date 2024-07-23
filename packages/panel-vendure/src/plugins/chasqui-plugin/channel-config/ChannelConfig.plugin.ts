import path from 'path';
import { PluginCommonModule, VendurePlugin } from '@vendure/core';
import { AdminUiExtension } from '@vendure/ui-devkit/compiler';
import { ChannelConfigResolver } from './api/channelConfig.resolver';
import { ShopOrderResolver } from './api/shopOrder.resolver';

@VendurePlugin({
  imports: [PluginCommonModule],
  adminApiExtensions: {
    resolvers: [ChannelConfigResolver],
  },
  shopApiExtensions: {
    resolvers: [ShopOrderResolver],
  },
})
export class ChannelConfigPlugin {
  static uiExtensions: AdminUiExtension = {
    extensionPath: path.join(__dirname, 'ui'),
    ngModules: [
      {
        type: 'shared' as const,
        ngModuleFileName: 'channelConfig-ui-extension.module.ts',
        ngModuleName: 'ChannelConfigUiExtensionModule',
      },
      {
        type: 'lazy',
        route: 'channelConfig',
        ngModuleFileName: 'channelConfig-ui-lazy.module.ts',
        ngModuleName: 'ChannelConfigUiExtensionLazyModule',
      },
    ],
  };
}
