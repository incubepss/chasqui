import path from 'path';
import { AdminUiExtension } from '@vendure/ui-devkit/compiler';

export const uiExtensions: AdminUiExtension = {
  id: 'shared',
  extensionPath: path.join(__dirname),
  ngModules: [
    {
      type: 'shared' as const,
      ngModuleFileName: 'shared-extension.module.ts',
      ngModuleName: 'SharedExtensionModule',
    },
  ],
};

export default {
  uiExtensions,
};
