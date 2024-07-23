import { PluginCommonModule, VendurePlugin } from '@vendure/core';
import { ScheduleModule } from '@nestjs/schedule';

import { ExpirationOrderService } from './services/expiration-order.service';

@VendurePlugin({
  imports: [PluginCommonModule, ScheduleModule.forRoot()],
  providers: [ExpirationOrderService],
  configuration: config => {
    return config;
  },
})
export class ExpirationOrderPlugin {}
