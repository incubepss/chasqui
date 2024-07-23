import { NgModule } from '@angular/core';
import { SharedModule, addNavMenuItem, registerCustomFieldComponent } from '@vendure/admin-ui/core';

import ProductorSelectorComponent from './components/productor-selector/productor-selector';

@NgModule({
  imports: [SharedModule],
  declarations: [ProductorSelectorComponent],
  providers: [
    registerCustomFieldComponent('Product', 'productor', ProductorSelectorComponent),
    addNavMenuItem(
      {
        id: 'productores',
        label: 'Productores',
        routerLink: ['/extensions/productores'],
        // Icon can be any of https://clarity.design/icons
        icon: 'employee-group',
        //requiresPermission: "ReadProductor"
      },
      'catalog',
    ),
  ],
  exports: [],
})
export class ProductorUiExtensionModule {}
