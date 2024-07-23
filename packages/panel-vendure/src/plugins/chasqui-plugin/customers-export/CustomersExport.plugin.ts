import path from 'path';
import { AdminUiExtension } from '@vendure/ui-devkit/compiler';

export class CustomersExportPlugin {
  static uiExtensions: AdminUiExtension = {
    extensionPath: path.join(__dirname, 'ui'),
    ngModules: [
      {
        type: 'shared' as const,
        ngModuleFileName: 'customers-export-ui-extension.module.ts',
        ngModuleName: 'CustomersExportUiExtensionModule',
      },
    ],
  };
}
