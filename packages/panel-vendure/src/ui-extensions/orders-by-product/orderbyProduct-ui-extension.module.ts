import { NgModule } from '@angular/core';
import { SharedModule, addNavMenuItem } from '@vendure/admin-ui/core';

@NgModule({
  imports: [SharedModule],
  providers: [
    addNavMenuItem(
      {
        id: 'ordersByProduct',
        label: 'Artículos en curso',
        routerLink: ['/extensions/ordersByProduct'],
        // Icon can be any of https://clarity.design/icons
        icon: 'bundle',
      },
      'sales',
    ),
  ],
  exports: [],
})
export class OrderByProductUiExtensionModule {}
