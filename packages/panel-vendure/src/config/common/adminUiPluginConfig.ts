import path from 'path';
import { LanguageCode } from '@vendure/core';
import { AdminUiPluginOptions } from '@vendure/admin-ui-plugin';

import { ROUTES } from './routes';

const adminUiPluginConfig: AdminUiPluginOptions = {
  route: ROUTES.admin,
  port: 3002,
  app: { path: path.join(__dirname, '../../../admin-ui/dist') },
  adminUiConfig: {
    brand: 'Chasqui',
    hideVendureBranding: true,
    adminApiPath: ROUTES.adminApiPath,
    defaultLanguage: LanguageCode.es,
    defaultLocale: 'AR',
    availableLanguages: [LanguageCode.es],
  },
};

export default adminUiPluginConfig;
