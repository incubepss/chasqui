import { NgModule } from '@angular/core';
import { SharedModule, addNavMenuItem } from '@vendure/admin-ui/core';

@NgModule({
  imports: [SharedModule],
  providers: [
    addNavMenuItem(
      {
        id: 'facets',
        label: 'Etiquetas',
        routerLink: ['/extensions/facets'],
        // Icon can be any of https://clarity.design/icons
        icon: 'tag',
      },
      'catalog',
    ),
  ],
  exports: [],
})
export class FacetReadonlyUiExtensionModule {}
