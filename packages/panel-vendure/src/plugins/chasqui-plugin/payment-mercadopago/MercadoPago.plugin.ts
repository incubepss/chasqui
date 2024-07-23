import { VendurePlugin, PluginCommonModule } from '@vendure/core';
import { MercadoPagoService } from './services/mercadoPago.service';
import { MPagoWebhookController } from './MercadoPago.controller';

@VendurePlugin({
  imports: [PluginCommonModule],
  controllers: [MPagoWebhookController],
  providers: [MercadoPagoService],
})
export class MercadoPagoPlugin {}
