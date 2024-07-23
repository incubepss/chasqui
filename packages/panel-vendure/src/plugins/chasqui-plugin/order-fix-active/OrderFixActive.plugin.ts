import { PluginCommonModule, VendurePlugin } from '@vendure/core';
import { shopApiExtensions } from './api/api-extension';
import { OrderFixShopApiResolver } from './api/OrderFixShopApi.resolver';
import { OrderFixActiveService } from './services/OrderFixActive.service';

@VendurePlugin({
  imports: [PluginCommonModule],
  shopApiExtensions: {
    schema: shopApiExtensions,
    resolvers: [OrderFixShopApiResolver],
  },
  providers: [OrderFixActiveService],
})
export class OrderFixActivePlugin {}
