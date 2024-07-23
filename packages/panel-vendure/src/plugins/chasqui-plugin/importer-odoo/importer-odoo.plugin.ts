import path from 'path';
import { OnModuleInit } from '@nestjs/common';
import {
  PluginCommonModule,
  VendurePlugin,
  LanguageCode,
  EventBus,
  OrderStateTransitionEvent,
} from '@vendure/core';
import { DataImportModule } from '@vendure/core/dist/data-import/data-import.module';
import { AdminUiExtension } from '@vendure/ui-devkit/compiler';

import { ProductoresPlugin } from '../productores/Productores.plugin';

import { OdooService } from './services/odoo.service';
import { ImporterOdooService } from './services/importer-odoo.service';
import { FacetImporter } from './services/helpers/facet-importer';
import { ProductoImporter } from './services/helpers/producto-importer';
import { ImagesImporter } from './services/helpers/images-importer';
import { ImporterOdooResolver } from './api/importer-odoo.resolver';
import { adminApiExtensions } from './api/api-extensions';
import { CollectionMakerService } from './services/helpers/collection-maker';
import { ProductorImporter } from './services/helpers/productor-importer';
import { OrderExport } from './services/helpers/order-export';
import { odooConnect } from './constants';
import { ODOO_PARAMS } from './services/paramsContext';

@VendurePlugin({
  imports: [PluginCommonModule, DataImportModule, ProductoresPlugin],
  adminApiExtensions: {
    schema: adminApiExtensions,
    resolvers: [ImporterOdooResolver],
  },
  providers: [
    ImporterOdooService,
    OdooService,
    ProductoImporter,
    ProductorImporter,
    FacetImporter,
    ImagesImporter,
    CollectionMakerService,
    OrderExport,
  ],
  configuration: config => {
    config.customFields.Channel.push(
      {
        name: 'odooHost',
        type: 'string',
        public: false,
        label: [{ languageCode: LanguageCode.es, value: 'Host Odoo' }],
        ui: { tab: 'Odoo' },
      },
      {
        name: 'odooDB',
        type: 'string',
        public: false,
        label: [{ languageCode: LanguageCode.es, value: 'Base de datos Odoo' }],
        ui: { tab: 'Odoo' },
      },
      {
        name: 'odooUser',
        type: 'string',
        public: false,
        label: [{ languageCode: LanguageCode.es, value: 'Usuario Odoo' }],
        ui: { tab: 'Odoo' },
      },
      {
        name: 'odooPass',
        type: 'string',
        public: false,
        label: [{ languageCode: LanguageCode.es, value: 'Contraseña Odoo' }],
        ui: { tab: 'Odoo', component: 'password-form-input' },
      },
      {
        name: 'odooCompanyId',
        type: 'int',
        public: false,
        label: [{ languageCode: LanguageCode.es, value: 'Compañia ID' }],
        ui: { tab: 'Odoo' },
      },
      {
        name: 'odooParams',
        type: 'text',
        public: false,
        ui: { tab: 'Odoo', component: 'json-editor-form-input' },
        label: [{ languageCode: LanguageCode.es, value: `Parámetros` }],
        description: [{ languageCode: LanguageCode.es, value: `Parámetros por defecto: ${ODOO_PARAMS}` }],
        //internal: true,
      },
    );
    config.authOptions.customPermissions.push(odooConnect);
    return config;
  },
})
export class ImporterOdooPlugin implements OnModuleInit {
  static uiExtensions: AdminUiExtension = {
    extensionPath: path.join(__dirname, 'ui'),
    ngModules: [
      {
        type: 'shared' as const,
        ngModuleFileName: 'importer-odoo-ui.module.ts',
        ngModuleName: 'ImporterOdooUIModule',
      },
      {
        type: 'lazy' as const,
        route: 'odoo',
        ngModuleFileName: 'importer-odoo-ui.lazy.module.ts',
        ngModuleName: 'ImporterOdooUILazyModule',
      },
    ],
    translations: {
      es: path.join(__dirname, 'i18n/es.json'),
    },
  };

  constructor(private eventBus: EventBus, private odooService: OdooService) {}

  onModuleInit() {
    this.eventBus.ofType(OrderStateTransitionEvent).subscribe((event: any) => {
      if (event.toState == 'PaymentAuthorized') {
        this.odooService.exportOrderToOdoo(event.ctx, event.order.id);
      }
    });
  }
}
