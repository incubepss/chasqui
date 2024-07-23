import { NgModule } from '@angular/core';
import { SharedModule, addNavMenuItem } from '@vendure/admin-ui/core';

@NgModule({
  imports: [SharedModule],
  providers: [
    addNavMenuItem(
      {
        id: 'channel-importer-odoo',
        label: 'Importar producto',
        routerLink: ['/extensions/odoo/importar-productos'],
        icon: 'import',
        requiresPermission: 'ReadOdooConnect',
      },
      'catalog',
    ),
    addNavMenuItem(
      {
        id: 'channel-export-odoo',
        label: 'Exportar pedidos',
        routerLink: ['/extensions/odoo/exportar-pedidos'],
        icon: 'export',
        requiresPermission: 'ReadOdooConnect',
      },
      'sales',
    ),
  ],
  exports: [],
})
export class ImporterOdooUIModule {}
