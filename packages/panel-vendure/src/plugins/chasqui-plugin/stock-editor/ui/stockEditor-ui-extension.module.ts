import { NgModule } from '@angular/core';
import { SharedModule, addNavMenuItem } from '@vendure/admin-ui/core';

@NgModule({
  imports: [SharedModule],
  providers: [
    addNavMenuItem(
      {
        id: 'stockEditor',
        label: 'Stock y precio',
        routerLink: ['/extensions/stockEditor'],
        // Icon can be any of https://clarity.design/icons
        icon: 'form',
        requiresPermission: 'ReadProduct',
      },
      'catalog',
      'facets',
    ),
  ],
  exports: [],
})
export class StockEditorUiExtensionModule {}
