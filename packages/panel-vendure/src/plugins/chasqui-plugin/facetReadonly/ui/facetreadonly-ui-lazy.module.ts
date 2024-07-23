import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import {
  SharedModule,
  detailBreadcrumb,
  FacetWithValues,
  createResolveData,
  CanDeactivateDetailGuard,
} from '@vendure/admin-ui/core';

import { FacetResolver } from './providers/facet-resolver';
import { FacetDetailComponent } from './components/facet-detail/facet-detail.component';
import { FacetListComponent } from './components/facet-list/facet-list.component';

@NgModule({
  imports: [
    SharedModule,
    RouterModule,
    RouterModule.forChild([
      {
        path: '',
        pathMatch: 'full',
        component: FacetListComponent,
        data: { breadcrumb: 'Etiquetas' },
      },
      {
        path: ':id',
        component: FacetDetailComponent,
        resolve: createResolveData(FacetResolver),
        canDeactivate: [CanDeactivateDetailGuard],
        data: {
          breadcrumb: facetBreadcrumb,
        },
      },
    ]),
  ],
  declarations: [FacetListComponent, FacetDetailComponent],
  providers: [],
})
export class FacetReadonlyUiExtensionLazyModule {}

export function facetBreadcrumb(data: any, params: any) {
  return detailBreadcrumb<FacetWithValues.Fragment>({
    entity: data.entity,
    id: params.id,
    breadcrumbKey: 'breadcrumb.facets',
    getName: facet => facet.name,
    route: '',
  });
}
