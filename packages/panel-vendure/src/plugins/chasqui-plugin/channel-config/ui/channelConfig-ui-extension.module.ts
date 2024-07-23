import { NgModule } from '@angular/core';
import { SharedModule, addNavMenuItem } from '@vendure/admin-ui/core';

@NgModule({
  imports: [SharedModule],
  providers: [
    addNavMenuItem(
      {
        id: 'channelConfig',
        label: 'Tienda',
        routerLink: ['/extensions/channelConfig'],
        // Icon can be any of https://clarity.design/icons
        icon: 'store',
        requiresPermission: 'UpdateChannel',
      },
      'settings',
      'shipping-methods',
    ),
  ],
  exports: [],
})
export class ChannelConfigUiExtensionModule {}
