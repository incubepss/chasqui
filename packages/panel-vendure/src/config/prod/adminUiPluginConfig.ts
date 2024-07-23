import path from 'path';
import { AdminUiPluginOptions } from '@vendure/admin-ui-plugin';

import commonAdminUiPluginConfig from '../common/adminUiPluginConfig';

const adminUiPluginConfig: AdminUiPluginOptions = {
  ...commonAdminUiPluginConfig,
  app: { path: path.join(__dirname, '../../../admin-ui/dist') },
};

export default adminUiPluginConfig;
