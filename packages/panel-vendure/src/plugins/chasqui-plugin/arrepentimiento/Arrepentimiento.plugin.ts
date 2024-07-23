import { PluginCommonModule, VendurePlugin } from '@vendure/core';
import { ArrepentimientoResolver } from './api/arrepentimiento.resolver';
import { shopApiExtensions } from './api/api-extensions';

@VendurePlugin({
  imports: [PluginCommonModule],
  shopApiExtensions: {
    schema: shopApiExtensions,
    resolvers: [ArrepentimientoResolver],
  },
})
export class ArrepentimientoPlugin {}
