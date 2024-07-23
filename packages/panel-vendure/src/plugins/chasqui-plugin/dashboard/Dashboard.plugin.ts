import path from 'path';
import { PluginCommonModule, VendurePlugin } from '@vendure/core';
import { AdminUiExtension } from '@vendure/ui-devkit/compiler';

@VendurePlugin({
  imports: [PluginCommonModule],
  providers: [],
  exports: [],
})
export class DashboardPlugin {
  static uiExtensions: AdminUiExtension = {
    extensionPath: path.join(__dirname, 'ui'),
    ngModules: [
      {
        type: 'shared' as const,
        ngModuleFileName: 'dashboard-ui-extension.module.ts',
        ngModuleName: 'DashboardUiExtensionModule',
      },
    ],
  };
}
