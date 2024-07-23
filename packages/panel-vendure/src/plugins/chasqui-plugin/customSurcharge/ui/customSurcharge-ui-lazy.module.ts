import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { SharedModule } from '@vendure/admin-ui/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { CustomSurchargeListComponent } from './components/customSurcharge-list/customSurcharge-list.component';
import { CustomSurchargeDetailComponent } from './components/customSurcharge-detail/customSurcharge-detail.component';
import { ExampleDetailResolver } from './providers/routing/customSurcharge-detail-resolver';
import { GetExample } from './generated-types';

@NgModule({
  imports: [
    SharedModule,
    RouterModule.forChild([
      {
        path: '',
        pathMatch: 'full',
        component: CustomSurchargeListComponent,
        data: {
          breadcrumb: [
            {
              label: 'Cargos adicionales',
              link: ['/extensions', 'customSurcharge'],
            },
          ],
        },
      },
      {
        path: ':id',
        component: CustomSurchargeDetailComponent,
        resolve: { entity: ExampleDetailResolver },
        data: { breadcrumb: exampleDetailBreadcrumb },
      },
    ]),
  ],
  declarations: [CustomSurchargeListComponent, CustomSurchargeDetailComponent],
  providers: [ExampleDetailResolver],
})
export class CustomSurchargeUiExtensionLazyModule {}

export function exampleDetailBreadcrumb(resolved: { entity: Observable<GetExample.Example> }): any {
  return resolved.entity.pipe(
    map(entity => [
      {
        label: 'Cargos adicionales',
        link: ['/extensions', 'customSurcharge'],
      },
      {
        label: `${entity.id}`,
        link: [],
      },
    ]),
  );
}
