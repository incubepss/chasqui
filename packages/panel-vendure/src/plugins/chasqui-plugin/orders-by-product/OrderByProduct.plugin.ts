import { VendurePlugin, PluginCommonModule } from '@vendure/core';
import { OrderByProductService } from './services/OrderByProduct.service';
import { adminApiExtensions } from './api/api-extensions';
import { OrderByProductResolver } from './api/orderByProduct.resolver';

@VendurePlugin({
  imports: [PluginCommonModule],
  adminApiExtensions: {
    schema: adminApiExtensions,
    resolvers: [OrderByProductResolver],
  },
  providers: [OrderByProductService],
  exports: [OrderByProductService],
})
export class OrderByProductPlugin {}
