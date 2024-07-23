import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { SharedModule, createResolveData } from '@vendure/admin-ui/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { ProductorListComponent } from './components/productor-list/productor-list.component';
import { ProductorEditorComponent } from './components/productor-editor/productor-editor';
import { SellosProductorSelector } from './components/sellos-productor-selector/sellos-productor-selector';
import ProductorEditorResolver from './providers/routing/productor-editor/productor-editor.resolver';

@NgModule({
  imports: [
    SharedModule,
    RouterModule,
    RouterModule.forChild([
      {
        path: '',
        pathMatch: 'full',
        component: ProductorListComponent,
        data: { breadcrumb: 'Productores' },
      },
      {
        path: ':id',
        component: ProductorEditorComponent,
        resolve: createResolveData(ProductorEditorResolver),
        data: { breadcrumb: editorBreadcrumb },
      },
    ]),
  ],
  declarations: [ProductorEditorComponent, ProductorListComponent, SellosProductorSelector],
  providers: [ProductorEditorResolver],
})
export class ProductorUiExtensionLazyModule {}

function editorBreadcrumb(resolved: { entity: Observable<any> }) {
  return resolved.entity.pipe(
    map(entity => [
      {
        label: 'Productores',
        link: ['/extensions', 'productores'],
      },
      {
        label: `Actualizar productor ${entity.id}`,
        link: [],
      },
    ]),
  );
}
