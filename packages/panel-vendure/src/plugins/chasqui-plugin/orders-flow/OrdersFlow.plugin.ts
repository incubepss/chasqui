import { VendurePlugin, PluginCommonModule } from '@vendure/core';

import { adminApiExtensions } from './api/api-extensions';
import { OrdersResolver } from './api/orders.resolver';
import { CustomOrderService } from './services/CustomOrder.service';
@VendurePlugin({
  imports: [PluginCommonModule],
  adminApiExtensions: {
    schema: adminApiExtensions,
    resolvers: [OrdersResolver],
  },
  providers: [CustomOrderService],
  exports: [CustomOrderService],
})
export class OrdersFlowPlugin {}
