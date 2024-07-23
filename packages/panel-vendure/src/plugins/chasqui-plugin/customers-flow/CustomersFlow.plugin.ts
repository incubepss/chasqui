/**
 * PLUGIN PARA SOBRE-ESCRIBIR COMPORTAMIENTO DEL SHOP-API RELACIONADO A RECUPERO DE CONTRASEÑA Y GESTIÓN DE CONSUMIDORES
 */

import { PluginCommonModule, VendurePlugin } from '@vendure/core';

import { CustomersShopApiResolver } from './api/customers-shop-api.resolver';
import { CustomUserService } from './service/custom-user.service';

@VendurePlugin({
  imports: [PluginCommonModule],
  shopApiExtensions: {
    resolvers: [CustomersShopApiResolver],
  },
  providers: [CustomUserService],
})
export class CustomersFlowPlugin {}
