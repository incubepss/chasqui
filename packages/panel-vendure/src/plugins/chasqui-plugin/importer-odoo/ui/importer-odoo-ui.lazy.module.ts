import { RouterModule } from '@angular/router';
import { NgModule } from '@angular/core';
import { SharedModule } from '@vendure/admin-ui/core';
import { ImporterUiComponent } from './components/importer-ui/importer-ui';
import { ExportOdooComponent } from './components/export-odoo/export-odoo';

@NgModule({
  imports: [
    SharedModule,
    RouterModule.forChild([
      {
        path: 'importar-productos',
        pathMatch: 'full',
        component: ImporterUiComponent,
        data: { breadcrumb: 'Importar productos' },
      },
      {
        path: 'exportar-pedidos',
        pathMatch: 'full',
        component: ExportOdooComponent,
        data: { breadcrumb: 'Exportar pedidos' },
      },
    ]),
  ],
  declarations: [ImporterUiComponent, ExportOdooComponent],
  providers: [],
  exports: [],
})
export class ImporterOdooUILazyModule {}
