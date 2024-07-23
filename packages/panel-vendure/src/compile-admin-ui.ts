import path from 'path';
import { compileUiExtensions, setBranding } from '@vendure/ui-devkit/compiler';
import { MultitiendaPlugin } from './plugins/chasqui-plugin/multitienda/Multitienda.plugin';
import { FacetReadonlyPlugin } from './plugins/chasqui-plugin/facetReadonly/FacetReadonly.plugin';

import SharedAdminExtension from './ui-extensions/shared/shared.adminextension';
import OrderByProductoAdminExtension from './ui-extensions/orders-by-product/ordersByProduct.adminextension';
import OrdersFlowAdminExtension from './ui-extensions/orders-flow/ordersFlow.adminextension';

import { ProductoresPlugin } from './plugins/chasqui-plugin/productores/Productores.plugin';
import { CustomSurchargePlugin } from './plugins/chasqui-plugin/customSurcharge/CustomSurcharge.plugin';
import { ChannelConfigPlugin } from './plugins/chasqui-plugin/channel-config/ChannelConfig.plugin';
import { StockEditorPlugin } from './plugins/chasqui-plugin/stock-editor/StockEditor.plugin';
import { DashboardPlugin } from './plugins/chasqui-plugin/dashboard/Dashboard.plugin';
import { CustomersExportPlugin } from './plugins/chasqui-plugin/customers-export/CustomersExport.plugin';
import { ImporterOdooPlugin } from './plugins/chasqui-plugin/importer-odoo/importer-odoo.plugin';

if (require.main === module) {
  // Called directly from command line
  customAdminUi({ recompile: true, devMode: false })
    .compile?.()
    .then(() => {
      process.exit(0);
    });
}

export function customAdminUi(options: { recompile: boolean; devMode: boolean }) {
  const compiledAppPath = path.join(__dirname, '../admin-ui');
  console.log('[CompileAdminUI]', `Recompile=${options.recompile} devMode=${options.devMode}`);
  if (options.recompile) {
    return compileUiExtensions({
      outputPath: compiledAppPath,
      devMode: options.devMode,
      baseHref: '/panel/',
      extensions: [
        SharedAdminExtension.uiExtensions,
        ProductoresPlugin.uiExtensions,
        CustomersExportPlugin.uiExtensions,
        CustomSurchargePlugin.uiExtensions,
        FacetReadonlyPlugin.uiExtensions,
        ChannelConfigPlugin.uiExtensions,
        OrdersFlowAdminExtension.uiExtensions,
        OrderByProductoAdminExtension.uiExtensions,
        StockEditorPlugin.uiExtensions,
        MultitiendaPlugin.uiExtensions,
        DashboardPlugin.uiExtensions,
        ImporterOdooPlugin.uiExtensions,
        {
          translations: {
            es: path.join(__dirname, 'translations/es.json'),
          },
          globalStyles: [
            path.join(__dirname, 'theme/leaflet-cdn.scss'),
            path.join(__dirname, 'theme/theme-chasqui.scss'),
            path.join(__dirname, 'theme/sidenav.scss'),
          ],
        },
        setBranding({
          // The small logo appears in the top left of the screen
          smallLogoPath: path.join(__dirname, 'images/chasqui_logo.png'),
          // The large logo is used on the login page
          largeLogoPath: path.join(__dirname, 'images/chasqui_logo.png'),
          faviconPath: path.join(__dirname, 'images/favicon.ico'),
        }),
      ],
    });
  } else {
    return {
      path: path.join(compiledAppPath, 'dist'),
    };
  }
}
