import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { SharedModule } from '@vendure/admin-ui/core';
import { PaginatorComponent } from './components/paginator/paginator.component';

import { StockEditorListComponent } from './components/stock-editor-list/stock-editor-list.component';

@NgModule({
  imports: [
    SharedModule,
    RouterModule,
    RouterModule.forChild([
      {
        path: '',
        pathMatch: 'full',
        component: StockEditorListComponent,
        data: {
          breadcrumb: 'Stock y precios',
        },
      },
    ]),
  ],
  declarations: [StockEditorListComponent, PaginatorComponent],
  providers: [],
})
export class StockEditorUiLazyModule {}
