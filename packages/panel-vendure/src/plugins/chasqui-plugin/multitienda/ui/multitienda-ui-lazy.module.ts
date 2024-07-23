import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { SharedModule } from '@vendure/admin-ui/core';

import { TiendaCreatorComponent } from './components/tienda-creator/tienda-editor';

@NgModule({
  imports: [
    SharedModule,
    RouterModule,
    RouterModule.forChild([
      {
        path: '',
        pathMatch: 'full',
        component: TiendaCreatorComponent,
        data: {
          breadcrumb: [
            {
              label: 'breadcrumb.channels',
              link: ['/settings/channels'],
            },
            {
              label: 'Nueva Tienda',
              link: [],
            },
          ],
        },
      },
    ]),
  ],
  declarations: [TiendaCreatorComponent],
  providers: [],
})
export class MultitiendaUiExtensionLazyModule {}
