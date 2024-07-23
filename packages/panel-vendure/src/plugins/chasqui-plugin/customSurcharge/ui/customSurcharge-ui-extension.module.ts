import { NgModule } from '@angular/core';
import { SharedModule, addNavMenuItem } from '@vendure/admin-ui/core';

@NgModule({
  imports: [SharedModule],
  providers: [
    addNavMenuItem(
      {
        id: 'customSurcharge',
        label: 'Cargos adicionales',
        routerLink: ['/extensions/customSurcharge'],
        // Icon can be any of https://clarity.design/icons
        icon: 'objects',
        requiresPermission: 'ReadCustomSurcharge',
      },
      'marketing',
    ),
  ],
  exports: [],
})
export class CustomSurchargeUiExtensionModule {}
