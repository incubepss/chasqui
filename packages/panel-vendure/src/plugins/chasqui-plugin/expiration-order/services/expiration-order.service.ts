import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import dotenv from 'dotenv';
import { Injectable, OnApplicationBootstrap } from '@nestjs/common';
import { CronExpression, SchedulerRegistry } from '@nestjs/schedule';

import {
  ChannelService,
  DefaultLogger,
  EventBus,
  isGraphQlErrorResult,
  ListQueryBuilder,
  Logger,
  Order,
  OrderService,
  RequestContext,
  TransactionalConnection,
} from '@vendure/core';
import { CronJob } from 'cron';
import { ExpirationOrderEvent } from './../events/ExpirationOrderEvent';

dayjs.extend(utc);

dotenv.config();

const EXPIRATION_CART_MINUTES = parseInt(process?.env?.EXPIRATION_CART_MINUTES || '0');

// docs crons job: https://docs.nestjs.com/techniques/task-scheduling
@Injectable()
export class ExpirationOrderService implements OnApplicationBootstrap {
  constructor(
    private connection: TransactionalConnection,
    private orderService: OrderService,
    private listQueryBuilder: ListQueryBuilder,
    private channelService: ChannelService,
    private schedulerRegistry: SchedulerRegistry,
    private eventBus: EventBus,
  ) {}

  onApplicationBootstrap() {
    DefaultLogger.restoreOriginalLogLevel(); // esto es para que muestre los Logger.info, en el proceso de bootstraping, el logger está deshabilitado por vendure
    if (EXPIRATION_CART_MINUTES > 0) {
      this.createCron();
      Logger.info(
        `Cron for expiration orders is ENABLED ${EXPIRATION_CART_MINUTES}m`,
        'ExpirationOrderPlugin',
      );
    } else {
      Logger.info('Cron for expiration orders is DISABLED', 'ExpirationOrderPlugin');
    }
  }

  private createCron() {
    const job = new CronJob(CronExpression.EVERY_MINUTE, this.doJob.bind(this));
    job.start();
    this.schedulerRegistry.addCronJob('expirator-orders', job);
  }

  private async doJob() {
    const ctx = new RequestContext({
      channel: await this.channelService.getDefaultChannel(),
      apiType: 'admin',
      isAuthorized: true,
      authorizedAsOwnerOnly: false,
      session: {} as any,
    });

    const expiredOrders = await this.findOrderExpired(ctx);

    await Promise.all(
      expiredOrders.map(order => {
        return this.expireOrder(ctx, order);
      }),
    );
    if (expiredOrders.length > 0) {
      Logger.info(`Chequeo de ordenes vencidas, cantidad ${expiredOrders.length}`, 'ExpirationOrderPlugin');
    }
  }

  private async findOrderExpired(ctx: RequestContext): Promise<Array<Order>> {
    const dateLimit = dayjs().utc().subtract(EXPIRATION_CART_MINUTES, 'minute');
    return this.listQueryBuilder
      .build(
        Order,
        {},
        {
          ctx,
          relations: ['customer'],
        },
      )
      .andWhere('order.active = true')
      .andWhere('order.updatedAt < :date ', { date: dateLimit })
      .getMany();
  }

  private async expireOrder(ctx: RequestContext, order: Order) {
    const cancelResult = await this.orderService.cancelOrder(ctx, {
      orderId: order.id,
      reason: 'Vencido por tiempo sin modificación',
    });
    if (isGraphQlErrorResult(cancelResult)) {
      Logger.warn(
        `Error on cancel the expired order ${order.id} - ${order.code} : ${cancelResult.errorCode} - ${cancelResult.message}`,
        'ExpirationOrderPlugin',
      );
    }

    await this.updateOrderPlaced(ctx, order);

    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    const transitionResult = await this.orderService.transitionToState(ctx, order.id, 'Expired');
    if (isGraphQlErrorResult(transitionResult)) {
      await this.deleteOrder(ctx, order);
      Logger.warn(
        `Error on transition to expired the Order ${order.id} - ${order.code} => order deleted`,
        'ExpirationOrderPlugin',
      );
      return transitionResult;
    }
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    if (transitionResult.state !== 'Expired') {
      Logger.warn(
        `Error on transition to expired the Order ${order.id} - ${order.code}`,
        'ExpirationOrderPlugin',
      );
      return this.deleteOrder(ctx, order);
    }
    this.eventBus.publish(new ExpirationOrderEvent(ctx, order));
    Logger.info(`Order expired ${order.id} - ${order.code}`, 'ExpirationOrderPlugin');
  }

  private updateOrderPlaced(ctx: RequestContext, order: Order) {
    return this.connection
      .getRepository(ctx, Order)
      .createQueryBuilder()
      .update()
      .set({
        orderPlacedAt: new Date(),
      })
      .where('id = :id', { id: order.id })
      .execute();
  }

  private async deleteOrder(ctx: RequestContext, order: Order): Promise<any> {
    try {
      await this.orderService.deleteOrder(ctx, order.id);
    } catch (e) {
      if (e instanceof TypeError && e.message.indexOf('orderToDelete.shippingLine') > -1) {
        return this.connection.getRepository(ctx, Order).delete(order.id);
      }
      throw e;
    }
  }
}
