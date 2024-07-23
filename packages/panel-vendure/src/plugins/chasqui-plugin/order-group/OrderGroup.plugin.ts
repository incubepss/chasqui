import { LanguageCode, PluginCommonModule, VendurePlugin } from '@vendure/core';

import { OrderByProductPlugin } from '../orders-by-product/OrderByProduct.plugin';
import { OrdersFlowPlugin } from '../orders-flow/OrdersFlow.plugin';

import { CustomerEntityResolver } from './api/customer-entity.resolver';
import { adminApiExtensions, shopApiExtensions } from './api/api-extensions';
import { OrderGroupService } from './services/OrderGroupService';
import { OrderGroup } from './entities/order-group.entity';
import { OrderShopResolver } from './api/order-shop.resolver';
import { OrderGroupEntityResolver } from './api/order-group-entity.resolver';
import { OrderGroupAdminResolver } from './api/order-group-admin.resolver';
import { OrderGroupShopResolver } from './api/order-group-shop.resolver';

@VendurePlugin({
  imports: [PluginCommonModule, OrdersFlowPlugin, OrderByProductPlugin],
  entities: [OrderGroup],
  adminApiExtensions: {
    schema: adminApiExtensions,
    resolvers: [OrderGroupAdminResolver, OrderGroupEntityResolver],
  },
  shopApiExtensions: {
    schema: shopApiExtensions,
    resolvers: [OrderGroupShopResolver, OrderGroupEntityResolver, CustomerEntityResolver, OrderShopResolver],
  },
  configuration: config => {
    config.customFields.Order.push({
      name: 'orderGroup',
      type: 'relation',
      graphQLType: 'OrderGroup',
      entity: OrderGroup,
      public: true,
      readonly: true,
      nullable: true,
      eager: false,
      label: [{ languageCode: LanguageCode.es, value: 'Pedido grupal' }],
    });

    config.customFields.Order.push({
      name: 'alias',
      type: 'string',
      list: false,
      public: true,
      defaultValue: '',
      label: [{ languageCode: LanguageCode.es, value: 'Alias' }],
    });

    /**
     * este campo determina si la orden es la principal
     */
    config.customFields.Order.push({
      name: 'isOrderHeadOfGroup',
      type: 'boolean',
      list: false,
      public: true,
      readonly: true,
      defaultValue: false,
      // label en blanco para que no aparzca en order detail editor de vendure
      label: [{ languageCode: LanguageCode.es, value: '' }],
      ui: { component: 'dummy-input' },
    });
    config.customFields.Order.push({
      name: 'isAGroupMember',
      type: 'boolean',
      list: false,
      public: false,
      internal: true,
      defaultValue: false,
    });
    return config;
  },
  providers: [OrderGroupService],
  exports: [OrderGroupService],
})
export class OrderGroupPlugin {}
