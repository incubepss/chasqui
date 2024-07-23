import { createCommand } from 'commander';
import { AdminUiPluginOptions } from '@vendure/admin-ui-plugin';

import { customAdminUi } from '../../compile-admin-ui';
import commonAdminUiPluginConfig from '../common/adminUiPluginConfig';

const program = createCommand();
program.option('-rc, --recompile <boolean>', 'Enable/Disabled recompile adminUI plugin').parse();
const options = program.opts();

const recompile = true && options?.recompile !== 'false';

const adminUiPluginConfig: AdminUiPluginOptions = {
  ...commonAdminUiPluginConfig,
  app: customAdminUi({ recompile, devMode: true }),
};

export default adminUiPluginConfig;
