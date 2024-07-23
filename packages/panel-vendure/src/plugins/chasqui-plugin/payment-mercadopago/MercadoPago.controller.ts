import { Controller, Get, Post } from '@nestjs/common';
import { PaymentService, Ctx, RequestContext, Logger, OrderService } from '@vendure/core';
import { MercadoPagoService } from './services/mercadoPago.service';

@Controller('mpago-webhook')
export class MPagoWebhookController {
  constructor(
    private paymentService: PaymentService,
    private orderService: OrderService,
    private mpService: MercadoPagoService,
  ) {}

  @Get()
  async receiveMPagoNotificationGET(@Ctx() ctx: RequestContext) {
    return this.receiveMPagoNotification(ctx);
  }

  @Post()
  async receiveMPagoNotification(@Ctx() ctx: RequestContext) {
    const query: any = ctx.req?.query;

    const typeEvent = query?.type || '';
    const orderCode = query?.order_code || '';
    const transactionId = query?.transaction_id || '';

    Logger.info(`MercadoPago event typeEvent=${typeEvent} orderCode=${orderCode}`, 'MercadoPagoPlugin');

    // chequear type evento
    if (typeEvent === 'payment') {
      if (!orderCode) {
        Logger.warn('Llegó aviso de payment de MercadoPago sin order_code', 'MercadoPagoPlugin');
        return '';
      }
      if (!transactionId) {
        Logger.warn('Llegó aviso de payment de MercadoPago sin transaction_id', 'MercadoPagoPlugin');
        return '';
      }
      await this.mpService.checkPaymentsToSettle(ctx, query.data_id, orderCode, transactionId);
    } else {
      Logger.warn('Unhandled typeEvent=' + typeEvent, 'MercadoPagoPlugin');
    }

    return '';
  }
}
