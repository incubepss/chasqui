import { PluginCommonModule, VendurePlugin } from '@vendure/core';
import { adminApiExtensions } from './api/api-extension';
import { StatsAdminApiResolver } from './api/stats.resolver';
import { StatsService } from './services/StatsService';

@VendurePlugin({
  imports: [PluginCommonModule],
  providers: [StatsService],
  adminApiExtensions: {
    schema: adminApiExtensions,
    resolvers: [StatsAdminApiResolver],
  },
  shopApiExtensions: {
    schema: adminApiExtensions,
    resolvers: [StatsAdminApiResolver],
  },
})
export class StatsPlugin {}
