import { NgModule } from '@angular/core';
import { SharedModule, addActionBarItem } from '@vendure/admin-ui/core';

@NgModule({
  imports: [SharedModule],
  declarations: [],
  providers: [
    addActionBarItem({
      id: 'create-tienda',
      label: 'Crear tienda',
      locationId: 'channel-list',
      routerLink: ['/extensions/crearTienda'],
      icon: 'store',
      requiresPermission: 'CreateChannel',
    }),
  ],
  exports: [],
})
export class MultitiendaUiExtensionModule {}
