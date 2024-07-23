import dotenv from 'dotenv';
import {
  DefaultSearchPlugin,
  VendureConfig,
  LanguageCode,
  Logger,
  DefaultLogger,
  LogLevel,
} from '@vendure/core';
import { BullMQJobQueuePlugin } from '@vendure/job-queue-plugin/package/bullmq';
import { EmailPlugin } from '@vendure/email-plugin';
import { AssetServerPlugin } from '@vendure/asset-server-plugin';
import { AdminUiPlugin } from '@vendure/admin-ui-plugin';
import { HardenPlugin } from '@vendure/harden-plugin';

import { OrderGroupPlugin } from './plugins/chasqui-plugin/order-group/OrderGroup.plugin';
import { StockEditorPlugin } from './plugins/chasqui-plugin/stock-editor/StockEditor.plugin';

import { MultitiendaPlugin } from './plugins/chasqui-plugin/multitienda/Multitienda.plugin';
import { PaymentMethodsPlugin } from './plugins/chasqui-plugin/payment-methods/PaymentMethods.plugin';
import { MercadoPagoPlugin } from './plugins/chasqui-plugin/payment-mercadopago/MercadoPago.plugin';
import { ProductoresPlugin } from './plugins/chasqui-plugin/productores/Productores.plugin';
import { CustomSurchargePlugin } from './plugins/chasqui-plugin/customSurcharge/CustomSurcharge.plugin';
import { ShippingPlugin } from './plugins/chasqui-plugin/shipping/Shipping.plugin';
import { FacetReadonlyPlugin } from './plugins/chasqui-plugin/facetReadonly/FacetReadonly.plugin';
import { ChannelConfigPlugin } from './plugins/chasqui-plugin/channel-config/ChannelConfig.plugin';

import apiOptionsConfig from './config/common/apiOptionsConfig';
import authOptionsConfig from './config/common/authOptionsConfig';
import catalogOptionsConfig from './config/common/catalogOptionsConfig';
import customFieldsConfig from './config/common/customFieldsConfig';
import emailPluginConfig from './config/common/emailPluginConfig';
import dbConnectionConfig from './config/common/dbConnectionConfig';
import assetServerPluginConfig from './config/common/assetServerPluginConfig';
import paymentOptionsConfig from './config/common/paymentOptionsConfig';
import promotionOptions from './config/common/promotionOptionsConfig';
import shippingOptionsConfig from './config/common/shippingOptions';

import adminUiPluginConfig from './config/dev/adminUiPluginConfig';
import { ArrepentimientoPlugin } from './plugins/chasqui-plugin/arrepentimiento/Arrepentimiento.plugin';
import { OrderByProductPlugin } from './plugins/chasqui-plugin/orders-by-product/OrderByProduct.plugin';
import { OrdersFlowPlugin } from './plugins/chasqui-plugin/orders-flow/OrdersFlow.plugin';
import { orderOptions } from './config/common/orderOptionsConfig';
import { CustomersFlowPlugin } from './plugins/chasqui-plugin/customers-flow/CustomersFlow.plugin';
import { CountryOverridePlugin } from './plugins/chasqui-plugin/country-override/CountryOverride.plugin';
import { OrderFixActivePlugin } from './plugins/chasqui-plugin/order-fix-active/OrderFixActive.plugin';
import { DashboardPlugin } from './plugins/chasqui-plugin/dashboard/Dashboard.plugin';
import { ChasquiPostgresSearchStrategy } from './strategies/ChasquiPostgresSearchStrategy';
import { TranslationsPlugin } from './plugins/chasqui-plugin/translations/Translations.plugin';
import { StatsPlugin } from './plugins/chasqui-plugin/stats/Stats.plugin';
import { ImporterOdooPlugin } from './plugins/chasqui-plugin/importer-odoo/importer-odoo.plugin';

dotenv.config();

const env = process.env;

Logger.info('DEV MODE · build watch admin-ui', 'VendureConfig');

export const config: VendureConfig = {
  defaultLanguageCode: LanguageCode.es,
  apiOptions: apiOptionsConfig,
  authOptions: authOptionsConfig,
  catalogOptions: catalogOptionsConfig,
  dbConnectionOptions: dbConnectionConfig,
  paymentOptions: paymentOptionsConfig,
  customFields: customFieldsConfig,
  orderOptions: orderOptions,
  promotionOptions: promotionOptions,
  shippingOptions: shippingOptionsConfig,
  importExportOptions: {
    importAssetsDir: env.IMPORT_ASSETS_DIR || '',
  },
  logger: new DefaultLogger({ level: LogLevel.Verbose }),
  plugins: [
    CountryOverridePlugin,
    MultitiendaPlugin,
    CustomersFlowPlugin,
    CustomSurchargePlugin,
    ProductoresPlugin,
    PaymentMethodsPlugin,
    MercadoPagoPlugin,
    ShippingPlugin,
    FacetReadonlyPlugin,
    ChannelConfigPlugin,
    ArrepentimientoPlugin,
    OrderByProductPlugin,
    OrdersFlowPlugin,
    OrderFixActivePlugin,
    StockEditorPlugin,
    OrderGroupPlugin,
    DashboardPlugin,
    StatsPlugin,
    AssetServerPlugin.init(assetServerPluginConfig),

    /**
     * por el warning de consola
     * BullMQ: DEPRECATION WARNING! Your redis options maxRetriesPerRequest must be null.
     *
     *  depende de BUllMQ > ioredis
     *  ver issue https://github.com/luin/ioredis/issues/1550
     *
     *  ioredis lo arregla en la version 5
     *
     * ver PR de Vendure https://github.com/vendure-ecommerce/vendure/pull/2020
     */
    BullMQJobQueuePlugin.init({
      connection: {
        host: env.REDIS_HOST || 'localhost',
        password: env.REDIS_PASSWORD || '',
        db: env.REDIS_DB || 0,
        port: 6379,
      },
    }),
    DefaultSearchPlugin.init({
      indexStockStatus: true,
      searchStategy: new ChasquiPostgresSearchStrategy(),
    }),
    EmailPlugin.init(emailPluginConfig),
    AdminUiPlugin.init(adminUiPluginConfig),
    TranslationsPlugin,
    HardenPlugin.init({
      maxQueryComplexity: 5000,
      apiMode: 'dev',
      logComplexityScore: true,
    }),
    ImporterOdooPlugin,
  ],
};
