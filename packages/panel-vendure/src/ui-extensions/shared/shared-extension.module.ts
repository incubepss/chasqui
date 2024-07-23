import { NgModule } from '@angular/core';
import { SharedModule, registerFormInputComponent } from '@vendure/admin-ui/core';
import { LeafletModule } from '@asymmetrik/ngx-leaflet';
import { LeafletDrawModule } from '@asymmetrik/ngx-leaflet-draw';

import { GeolocationService } from './services/GeolocationService';

import { GeolocationInputComponent } from './components/geolocation-input/geolocation-input.component';
import { GeolocationDialog } from './components/geolocation-dialog/geolocation.dialog';
import { GeolocationSearchComponent } from './components/geolocation-search/geolocation-search.component';
import { ShippingMethodFilterComponent } from './components/shippingMethod-filter/shippingMethod-filter.component';
import { DummyInput } from './components/dummy-input/dummy-input.component';

@NgModule({
  imports: [SharedModule, LeafletModule, LeafletDrawModule],
  declarations: [
    GeolocationInputComponent,
    GeolocationDialog,
    GeolocationSearchComponent,
    ShippingMethodFilterComponent,
  ],
  providers: [
    GeolocationService,
    registerFormInputComponent('geolocation-input', GeolocationInputComponent),
    registerFormInputComponent('dummy-input', DummyInput),
  ],
  exports: [ShippingMethodFilterComponent],
})
export class SharedExtensionModule {}
