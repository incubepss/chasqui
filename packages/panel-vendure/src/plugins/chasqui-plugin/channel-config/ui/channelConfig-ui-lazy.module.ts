import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { SharedModule } from '@vendure/admin-ui/core';

import { ChannelConfigDetailComponent } from './components/channelConfig-detail/channelConfig-detail.component';
import { ChannelConfigDetailResolver } from './providers/routing/channelConfig-detail-resolver';

@NgModule({
  imports: [
    SharedModule,
    RouterModule,
    RouterModule.forChild([
      {
        path: '',
        pathMatch: 'full',
        component: ChannelConfigDetailComponent,
        resolve: { entity: ChannelConfigDetailResolver },
        data: {
          breadcrumb: 'Ajustes de tienda',
        },
      },
    ]),
  ],
  declarations: [ChannelConfigDetailComponent],
  providers: [ChannelConfigDetailResolver],
})
export class ChannelConfigUiExtensionLazyModule {}
