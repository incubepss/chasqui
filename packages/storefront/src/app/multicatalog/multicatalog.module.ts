import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';

import { SharedModule } from '../shared/shared.module';
import { CoreModule } from './../core/core.module';
import { routes } from './multicatalog.routes';

import { MulticatalogListComponent } from './components/multicatalog-list/multicatalog-list.component';
import { MulticatalogProductListComponent } from './components/multicatalog-product-list/multicatalog-product-list.component';

const DECLARATIONS = [MulticatalogListComponent, MulticatalogProductListComponent];

@NgModule({
  declarations: DECLARATIONS,
  imports: [SharedModule, CoreModule, RouterModule.forChild(routes)],
  providers: [],
})
export class MulticatalogModule {}
