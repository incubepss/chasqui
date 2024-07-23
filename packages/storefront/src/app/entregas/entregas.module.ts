import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { LeafletModule } from '@asymmetrik/ngx-leaflet';
import { NgbAccordionModule } from '@ng-bootstrap/ng-bootstrap';

import { EntregasMapaComponent } from './components/entregas-mapa/entregas-mapa.component';
import { SharedModule } from './../shared/shared.module';
import { routes } from './entregas.routes';
import { EntregasComponent } from './components/entregas/entregas.component';
import { ShippingMethodsResolver } from './providers/shippingMethods.resolver';

const DECLARATIONS = [EntregasComponent, EntregasMapaComponent];

@NgModule({
  declarations: DECLARATIONS,
  providers: [ShippingMethodsResolver],
  imports: [SharedModule, LeafletModule, RouterModule.forChild(routes), NgbAccordionModule],
})
export class EntregasModule {}
