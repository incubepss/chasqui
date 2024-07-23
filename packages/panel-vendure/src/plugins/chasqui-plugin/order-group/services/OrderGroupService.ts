import { Brackets } from 'typeorm';
import { Injectable } from '@nestjs/common';
import { customAlphabet } from 'nanoid';
import dayjs from 'dayjs';

import { DEFAULT_CHANNEL_CODE } from '@vendure/common/lib/shared-constants';
import {
  ListQueryBuilder,
  RequestContext,
  TransactionalConnection,
  OrderLine,
  Order,
  isGraphQlErrorResult,
  OrderService,
  Channel,
  ErrorResultUnion,
  GraphQLErrorResult,
  Fulfillment,
  FulfillmentService,
  FulfillmentState,
  Logger,
  EventBus,
  CustomerService,
  ShippingMethod,
} from '@vendure/core';

import { ID, PaginatedList } from '@vendure/common/lib/shared-types';
import {
  CreateAddressInput,
  AddFulfillmentToOrderResult,
  OrderListOptions,
  FulfillOrderInput,
} from '@vendure/common/lib/generated-types';

import { TranslatorService } from '@vendure/core/dist/service/helpers/translator/translator.service';
import { OrderGroup, OrderGroupState } from '../entities/order-group.entity';
import { OrderGroupStateTransitionEvent } from '../entities/ordergroup-state-transition-event';
import { OrderByProductService } from '../../orders-by-product/services/OrderByProduct.service';
import { CancelOrderOfGroupError, CancelOrderOfOrderGroupResult } from '../api/errors';
import { CustomOrderService } from './../../orders-flow/services/CustomOrder.service';

const nanoid = customAlphabet('123456789ABCDEFGHJKMNPQRSTUVWXYZ', 4);

const generateCode = (): string => {
  return 'G' + dayjs().format('YYMM') + nanoid();
};

/** estados de una la orden validas para ser agregadas a un grupo
 *  Condiciona actual: que no esten "en preparacion"  */
const ALLOW_ORDER_STATES_TO_GROUP = [
  'AddingItems',
  'ArrangingPayment',
  'PaymentAuthorized',
  'PaymentSettled',
];

const CONFIRMED_ORDERS_STATES = [
  // Modificando,
  'Modifying',
  'ArrangingAdditionalPayment',
  // Nuevos
  'ArrangingPayment',
  'PaymentAuthorized',
  'PaymentSettled',
  // En Preparacion
  'WithFulfill',
  // En Entrega
  'PartiallyShipped',
  'Shipped',
  // Entregados
  'PartiallyDelivered',
  'Delivered',
];

@Injectable()
export class OrderGroupService {
  constructor(
    private listQueryBuilder: ListQueryBuilder,
    private connection: TransactionalConnection,
    private orderService: OrderService,
    private translator: TranslatorService,
    private customOrderService: CustomOrderService,
    private fulfillmentService: FulfillmentService,
    private orderByProductService: OrderByProductService,
    private customerService: CustomerService,
    private eventBus: EventBus,
  ) {}

  async findAll(ctx: RequestContext, options?: any): Promise<PaginatedList<OrderGroup>> {
    let customerId = '';
    let shippingMethodId = '';
    let key = '';

    if (options?.filter?.customerId) {
      customerId = options.filter.customerId.eq;
      delete options.filter['customerId'];
    }

    if (options?.filter?.shippingMethodId) {
      shippingMethodId = options.filter.shippingMethodId.eq;
      delete options.filter['shippingMethodId'];
    }

    if (options?.filter?.key) {
      key = options.filter.key.eq || options.filter.key.contains;
      delete options.filter['key'];
    }

    const query = this.listQueryBuilder
      .build(OrderGroup, options, {
        ctx,
        relations: ['customer', 'channel', 'shippingLine'],
      })
      .leftJoinAndSelect('ordergroup.shippingLine', 'shippingLine')
      .andWhere('ordergroup.channelId = :channelId', { channelId: ctx.channelId });

    if (customerId) {
      query.andWhere('ordergroup.customerId = :customerId', { customerId });
    }

    if (shippingMethodId) {
      query.andWhere('ordergroup.shippingMethod.id = :shippingMethodId ', {
        shippingMethodId: shippingMethodId,
      });
    }

    if (key) {
      query.leftJoin('ordergroup.customer', 'customer');
      query.andWhere(
        new Brackets(qb => {
          key = `%${key}%`;
          qb.where('lower(customer.lastName) like lower(:key)', { key })
            .orWhere('lower(customer.firstName) like lower(:key)', { key })
            .orWhere('lower(customer.emailAddress) like lower(:key)', { key })
            .orWhere('lower(ordergroup.code) like lower(:key)', { key });
        }),
      );
    }

    // TODO: usar query.leftJoinAndMapOne + getManyAndCount cuando TypeORM fixee este issue:
    // https://github.com/typeorm/typeorm/issues/5637

    // CALCULA totalQuantity
    query
      .leftJoin(
        qb => {
          return qb
            .select('count(oi.*)', 'qty')
            .addSelect('o.orderGroupId')
            .from('order_item', 'oi')
            .leftJoin('order_line', 'ol', 'ol.id = oi.lineId')
            .innerJoin('order', 'o', 'o.id  = ol.orderId')
            .where('o.orderGroupId is not null')
            .andWhere('o.state IN (:...states)', { states: CONFIRMED_ORDERS_STATES })
            .groupBy('o.orderGroupId');
        },
        's1',
        's1."orderGroupId" = ordergroup.id',
      )
      .addSelect('s1.qty', 'totalQuantity');

    // CALCULA montos totales sin y con Tax
    query
      .leftJoin(
        qb => {
          return qb
            .select('o.orderGroupId')
            .addSelect('count(o.id)', 'ordersQuantity')
            .addSelect('sum(o.shipping)', 'shipping')
            .addSelect('sum(o.shippingWithTax)', 'shippingWithTax')
            .addSelect('sum(o.subTotal)', 'subTotal')
            .addSelect('sum(o.subTotalWithTax)', 'subTotalWithTax')
            .from('order', 'o')
            .where('o.orderGroupId is not null')
            .andWhere('o.state in (:...states)', { states: CONFIRMED_ORDERS_STATES })
            .groupBy('o.orderGroupId');
        },
        's2',
        's2."orderGroupId" = ordergroup.id',
      )
      .addSelect('s2."ordersQuantity"', 'ordersQuantity')
      .addSelect('s2."shipping"', 'shipping')
      .addSelect('s2."shippingWithTax"', 'shippingWithTax')
      .addSelect('s2."subTotal"', 'subTotal')
      .addSelect('s2."subTotalWithTax"', 'subTotalWithTax');

    // HIDRATA las propiedades
    const result = await query.getRawAndEntities();
    let { entities } = result;
    const { raw } = result;

    entities = entities.map((entity, index) => {
      entity.ordersQuantity = parseInt(raw[index].ordersQuantity || '0');
      entity.totalQuantity = parseInt(raw[index].totalQuantity || '0');
      entity.shipping = parseInt(raw[index].shipping || '0');
      entity.shippingWithTax = parseInt(raw[index].shippingWithTax || '0');
      entity.subTotal = parseInt(raw[index].subTotal || '0');
      entity.subTotalWithTax = parseInt(raw[index].subTotalWithTax || '0');
      entity.total = entity.shipping + entity.subTotal;
      entity.totalWithTax = entity.shippingWithTax + entity.subTotalWithTax;
      return entity;
    });

    // CALCULA CANTIDAD Y RETORNA
    return query.getCount().then(totalItems => {
      return {
        items: entities,
        totalItems,
      };
    });
  }

  countByState(ctx: RequestContext, options?: any): Promise<any> {
    const shippingMethodId = options?.shippingMethodId || undefined;
    let key = options?.key || undefined;
    const orderPlacedAt = options?.orderPlacedAt || undefined;

    const query = this.connection.rawConnection
      .createQueryBuilder()
      .select('ordergroup.state', 'state')
      .addSelect('count(ordergroup.id)', 'count')
      .from(OrderGroup, 'ordergroup')
      .where('ordergroup.channelId = :channelId', { channelId: ctx.channelId });

    // CALCULA montos totales sin y con Tax
    query
      .leftJoin(
        qb => {
          return qb
            .select('o.orderGroupId')
            .addSelect('count(o.id)', 'ordersQuantity')
            .addSelect('sum(o.subTotalWithTax)', 'subTotalWithTax')
            .addSelect('sum(o.shippingWithTax)', 'shippingWithTax')
            .from('order', 'o')
            .where('o.orderGroupId is not null')
            .andWhere('o.state in (:...states)', { states: CONFIRMED_ORDERS_STATES })
            .groupBy('o.orderGroupId');
        },
        's2',
        's2."orderGroupId" = ordergroup.id',
      )
      .addSelect('sum(s2."subTotalWithTax")', 'subTotalWithTax')
      .addSelect('sum(s2."shippingWithTax")', 'subTotalshippingWithTax');

    if (shippingMethodId) {
      query.andWhere('ordergroup.shippingMethod.id = :shippingMethodId ', {
        shippingMethodId: shippingMethodId,
      });
    }

    if (key) {
      query.leftJoin('ordergroup.customer', 'customer');
      query.andWhere(
        new Brackets(qb => {
          key = `%${key}%`;
          qb.where('lower(customer.lastName) like lower(:key)', { key })
            .orWhere('lower(customer.firstName) like lower(:key)', { key })
            .orWhere('lower(customer.emailAddress) like lower(:key)', { key })
            .orWhere('lower(ordergroup.code) like lower(:key)', { key });
        }),
      );
    }

    if (orderPlacedAt) {
      if (orderPlacedAt.before) {
        query.andWhere('ordergroup.orderPlacedAt <= :endDate', { endDate: orderPlacedAt.before });
      } else if (orderPlacedAt.after) {
        query.andWhere('ordergroup.orderPlacedAt >= :startDate', { startDate: orderPlacedAt.after });
      } else if (orderPlacedAt.between) {
        query.andWhere('ordergroup.orderPlacedAt >= :startDate', { startDate: orderPlacedAt.between.start });
        query.andWhere('ordergroup.orderPlacedAt <= :endDate', { endDate: orderPlacedAt.between.end });
      }
    }

    query.groupBy('ordergroup.state');

    return query.getRawMany();
  }

  async findOneByCode(ctx: RequestContext, code: string): Promise<OrderGroup | undefined> {
    const query = this.connection
      .getRepository(ctx, OrderGroup)
      .createQueryBuilder('ordergroup')
      .leftJoinAndSelect('ordergroup.customer', 'customer')
      .leftJoinAndSelect('ordergroup.channel', 'channel')
      .leftJoinAndSelect('ordergroup.shippingLine', 'shippingLine')
      .leftJoinAndSelect('ordergroup.shippingMethod', 'shippingMethod')
      .where('ordergroup.code = :code', { code });

    // CALCULA totalQuantity
    // TODO: aplicar filtros de options en subqueries
    query
      .leftJoin(
        qb => {
          return qb
            .select('count(oi.*)', 'qty')
            .addSelect('o.orderGroupId')
            .from('order_item', 'oi')
            .leftJoin('order_line', 'ol', 'ol.id = oi.lineId')
            .innerJoin('order', 'o', 'o.id  = ol.orderId')
            .where('o.orderGroupId is not null')
            .andWhere('o.state in (:...states)', { states: CONFIRMED_ORDERS_STATES })
            .groupBy('o.orderGroupId');
        },
        's1',
        's1."orderGroupId" = ordergroup.id',
      )
      .addSelect('s1.qty', 'totalQuantity');

    // CALCULA montos totales sin y con Tax
    // TODO: aplicar filtros de options en subqueries
    query
      .leftJoin(
        qb => {
          return qb
            .select('o.orderGroupId')
            .addSelect('count(o.id)', 'ordersQuantity')
            .addSelect('sum(o.shipping)', 'shipping')
            .addSelect('sum(o.shippingWithTax)', 'shippingWithTax')
            .addSelect('sum(o.subTotal)', 'subTotal')
            .addSelect('sum(o.subTotalWithTax)', 'subTotalWithTax')
            .from('order', 'o')
            .where('o.orderGroupId is not null')
            .andWhere('o.state in (:...states)', { states: CONFIRMED_ORDERS_STATES })
            .groupBy('o.orderGroupId');
        },
        's2',
        's2."orderGroupId" = ordergroup.id',
      )
      .addSelect('s2."ordersQuantity"', 'ordersQuantity')
      .addSelect('s2."shipping"', 'shipping')
      .addSelect('s2."shippingWithTax"', 'shippingWithTax')
      .addSelect('s2."subTotal"', 'subTotal')
      .addSelect('s2."subTotalWithTax"', 'subTotalWithTax');

    // HIDRATA las propiedades
    const result = await query.getRawAndEntities();
    let { entities } = result;
    const { raw } = result;

    entities = entities.map((entity, index) => {
      entity.ordersQuantity = parseInt(raw[index].ordersQuantity || '0');
      entity.totalQuantity = parseInt(raw[index].totalQuantity || '0');
      entity.shipping = parseInt(raw[index].shipping || '0');
      entity.shippingWithTax = parseInt(raw[index].shippingWithTax || '0');
      entity.subTotal = parseInt(raw[index].subTotal || '0');
      entity.subTotalWithTax = parseInt(raw[index].subTotalWithTax || '0');
      entity.total = entity.shipping + entity.subTotal;
      entity.totalWithTax = entity.shippingWithTax + entity.subTotalWithTax;
      return entity;
    });

    const og = entities?.[0];
    if (og) {
      og.shippingMethod = await this._loadShippingMethodTranslated(ctx, og.shippingMethod);
    }

    return og;
  }

  async findOrderGroupOfOrder(ctx: RequestContext, orderId: ID): Promise<OrderGroup | undefined> {
    const query = this.connection
      .getRepository(ctx, OrderGroup)
      .createQueryBuilder('ordergroup')
      .leftJoinAndSelect('ordergroup.customer', 'customer')
      .leftJoinAndSelect('ordergroup.channel', 'channel')
      .leftJoinAndSelect('ordergroup.shippingLine', 'shippingLine')
      .leftJoinAndSelect('ordergroup.shippingMethod', 'shippingMethod')
      .innerJoin('order', 'order', 'order.orderGroupId = ordergroup.id')
      .where('order.id = :orderId', { orderId });

    const og = await query.getOne();
    if (og) {
      og.shippingMethod = await this._loadShippingMethodTranslated(ctx, og.shippingMethod);
    }

    return og;
  }

  async ordersOfGroup(
    ctx: RequestContext,
    orderGroupId: ID,
    options?: OrderListOptions,
    onlyConfirmed = false,
  ): Promise<PaginatedList<Order>> {
    // deshabilita order, siempre es por customer
    delete options?.sort;

    const query = await this.listQueryBuilder.build(Order, options, {
      ctx,
      relations: ['customer', 'lines', 'shippingLines', 'lines.productVariant'],
      channelId: ctx.channelId,
    });

    // IMPROVE: oportunidad de optimizar creando un GENERANTED COLUMN + creando index de fullname
    // ademas de order sin case sensitive
    query.leftJoin('order.customer', 'customer');
    query.addSelect('customer.firstName').addSelect('customer.lastName');
    query.orderBy('customer.firstName').addOrderBy('customer.lastName');

    if (onlyConfirmed) {
      query.andWhere('order.state in (:...states)', { states: CONFIRMED_ORDERS_STATES });
    }

    query.andWhere('order.orderGroupId = :orderGroupId', { orderGroupId });

    return query.getManyAndCount().then(([items, totalItems]) => {
      return {
        items,
        totalItems,
      };
    });
  }

  linesGroup(ctx: RequestContext, orderGroupId: ID): Promise<Array<OrderLine>> {
    const query = this.connection
      .getRepository(ctx, OrderLine)
      .createQueryBuilder('orderLine')
      .leftJoinAndSelect('orderLine.items', 'items')
      .leftJoin('order', 'o', 'o.id = orderLine.orderId')
      .where('o.orderGroupId = :orderGroupId', { orderGroupId: orderGroupId })
      .andWhere('o.state in (:...states)', { states: CONFIRMED_ORDERS_STATES })
      .orderBy('o.id')
      .getMany();
    return query;
  }

  /**
   * @experimental
   */
  linesGroupGrouped(ctx: RequestContext, orderGroupId: ID) {
    return this.orderByProductService.findAll(ctx, {
      orderGroupId,
      states: CONFIRMED_ORDERS_STATES,
    });
  }

  totalQuantity(ctx: RequestContext, orderGroupId: ID): Promise<number> {
    const query = this.connection.rawConnection
      .createQueryBuilder()
      .select('count(oi.*)')
      .from('order_item', 'oi')
      .leftJoin('order_line', 'ol', 'ol.id = oi.lineId')
      .innerJoin('order', 'o', 'o.id  = ol.orderId')
      .where('o.orderGroupId = :orderGroupId', { orderGroupId: orderGroupId })
      .andWhere('o.state IN (:...states)', { states: CONFIRMED_ORDERS_STATES })
      .getRawOne()
      .then(response => response.count);
    return query;
  }

  /**
   * Determina si la orden pertenece a un grupo donde el dueño sea el usuario activo
   *
   * Sirve para determinar si el usuario activo tiene permiso de lectura para la orden
   */
  async isActiveUserOwnerGroupForOrder(ctx: RequestContext, orderId: ID): Promise<boolean> {
    return this.connection.rawConnection
      .createQueryBuilder()
      .select('o.id')
      .from('order', 'o')
      .innerJoin('order_group', 'og', 'og.id = o.orderGroupId')
      .innerJoin('customer', 'og_customer', 'og_customer.id = og.customerId')
      .where('o.id = :orderId and og_customer.userId = :userIdOwnerGroup', {
        orderId,
        userIdOwnerGroup: ctx.activeUserId,
      })
      .getRawOne()
      .then(r => !!r);
  }

  /**
   * Dueño de Grupo confirma el pedido grupal
   */
  async confirmOrderGroup(ctx: RequestContext, orderGroupCode: string): Promise<OrderGroup> {
    const query = this.connection
      .getRepository(ctx, OrderGroup)
      .createQueryBuilder('ordergroup')
      .leftJoinAndSelect('ordergroup.customer', 'customer')
      .leftJoinAndSelect('ordergroup.channel', 'channel')
      .where('ordergroup.code = :code and ordergroup.channelId = :channelId', {
        code: orderGroupCode,
        channelId: ctx.channelId,
      })
      .andWhere('customer.userId = :userId', { userId: ctx.activeUserId });

    const orderGroup = await query.getOneOrFail();

    if (isGraphQlErrorResult(orderGroup)) {
      return orderGroup;
    }

    // Valida que este en estado activo
    if (!orderGroup.active || orderGroup.state !== 'AddingOrders') {
      throw new Error('Grupo no está activo');
    }

    // Transicionar de estado a confirmado
    const fromState = orderGroup.state;
    orderGroup.state = 'ConfirmedByOwner';
    orderGroup.active = false;
    orderGroup.orderPlacedAt = new Date();
    const saved = await this.connection.getRepository(ctx, OrderGroup).save(orderGroup, { reload: true });

    this.eventBus.publish(new OrderGroupStateTransitionEvent(fromState, saved.state, ctx, saved));

    return saved;
  }

  /**
   * Gestor de tienda acepta el pedido, creando un fulfilment de los items
   */
  async createFulfillment(
    ctx: RequestContext,
    orderGroupId: ID,
    input: FulfillOrderInput,
  ): Promise<ErrorResultUnion<AddFulfillmentToOrderResult, Fulfillment>> {
    //TODO: validar que no haya ningun pedido en "AddingItems"
    //TODO: validar que este en 'ConfirmedByOwner
    //TODO: transicionar
    //TODO: mandar email por evento

    // crea fulfillment
    const fulfillment = await this.customOrderService.createFulfillment(ctx, input);

    if (isGraphQlErrorResult(fulfillment)) {
      return fulfillment;
    }

    this._transitionTo(ctx, orderGroupId, 'AcceptedByChannel');

    return fulfillment;
  }

  /**
   * @description
   * Returns an array of all Fulfillments associated with the Order.
   */
  async getOrderGroupFulfillments(ctx: RequestContext, orderGroupId: ID): Promise<Fulfillment[]> {
    return this.connection.rawConnection
      .getRepository(Fulfillment)
      .createQueryBuilder('f')
      .innerJoin('order_item_fulfillments_fulfillment', 'oiff', 'oiff.fulfillmentId  = f.id ')
      .innerJoin('order_item', 'oi', 'oi.id  = oiff.orderItemId ')
      .innerJoin('order_line', 'ol', 'ol.id = oi.lineId')
      .innerJoin('order', 'o', 'o.id  = ol.orderId')
      .where('o.orderGroupId = :orderGroupId', { orderGroupId })
      .getMany();
  }

  /**
   * Crea una orden grupal sin order previa.
   *
   * Antes de compartir enlace, se necesita el shippingMethod y el shippingAddress
   *
   **/
  async createOrderGroup(
    ctx: RequestContext,
    shippingMethodId: ID,
    shippingAddress?: CreateAddressInput,
  ): Promise<OrderGroup> {
    const channel = ctx.channel;

    // busca consumidor activo
    if (!ctx.activeUserId) {
      throw new Error('No active user found');
    }
    const customer = await this.customerService.findOneByUserId(ctx, ctx.activeUserId);
    if (isGraphQlErrorResult(customer)) {
      throw (customer as GraphQLErrorResult).message;
    } else if (!customer) {
      throw new Error('No customer for the active user found');
    }

    // busca shippingMethod
    const shippingMethod = await this.connection.getRepository(ctx, ShippingMethod).findOne(shippingMethodId);

    if (!shippingMethod) {
      throw new Error('message.shippingMethod-not-found');
    }

    // crear el grupo
    const code = generateCode();
    const newOrderGroup = new OrderGroup({
      active: true,
      state: 'AddingOrders',
      alias: code,
      code: code,
      shippingAddress: shippingAddress,
      shippingMethod,
      customer,
      channel: channel,
    });
    const orderGroup = await this.connection.getRepository(ctx, OrderGroup).save(newOrderGroup);

    if (isGraphQlErrorResult(orderGroup)) {
      throw (orderGroup as GraphQLErrorResult).message;
    }

    return orderGroup;
  }

  /**
   * Crea una compra grupal asociada a la orden una order para marcarla como headOfGroup
   *
   * Este escenario, es para un consumidor que quiere compartir con personas su pedido, se activa en el proceso finalización de compras
   *
   * PRE-CONDICION: la Order ya tiene que tener que tener creado el shippingLine
   */
  async createOrderGroupByOrder(ctx: RequestContext, firstOrderId: ID): Promise<OrderGroup> {
    // traer shippingLIne y shippingAddress de la firstOrder
    const order = await this.connection.getRepository(ctx, Order).findOne(firstOrderId, {
      relations: ['customer', 'shippingLines', 'channels'],
    });

    if (isGraphQlErrorResult(order)) {
      throw order;
    }

    if (!order) {
      throw new Error('Order not found');
    }

    // sino tiene shippingLine patear la creación
    const validationError = this._assertWithShippingLine(order) || this._assertOrderActiveState(order);
    if (validationError) {
      throw validationError;
    }

    const channel = this._getChannel(order);

    if (!channel) {
      throw new Error("Channel's Order not found");
    }

    const shippingMethod = await this._getShippingMethod(ctx, order);

    if (!shippingMethod) {
      throw new Error(`message.cannot-create-ordergroup-without-shipping-lines-or-shippingMethod`);
    }

    // usar el shipping
    const code = generateCode();
    const newOrderGroup = new OrderGroup({
      active: true,
      state: 'AddingOrders',
      alias: code,
      code: code,
      shippingAddress: order.shippingAddress,
      shippingLine: order.shippingLines[0],
      shippingMethod,
      customer: order.customer,
      channel: channel,
    });
    const orderGroup = await this.connection.getRepository(ctx, OrderGroup).save(newOrderGroup);

    if (isGraphQlErrorResult(orderGroup)) {
      throw (orderGroup as GraphQLErrorResult).message;
    }

    // link order to group y mark as Head of Group
    await this.connection.rawConnection
      .createQueryBuilder()
      .update(Order)
      .set({
        customFields: {
          orderGroup: orderGroup,
          isOrderHeadOfGroup: true,
          isAGroupMember: true,
        },
      })
      .where('id = :id', { id: order.id })
      .execute();

    // aplica reajuste para aplicar promociones (si es que hay activas para la tienda)
    await this.applyPriceAdjustments(ctx, order.id);

    return orderGroup;
  }

  /**
   * desvincula o deshace pedido grupal (asociado a pedido individual)
   */
  async deactivateOrderGroup(ctx: RequestContext, firstOrderId: ID): Promise<Order> {
    const order: Order | undefined = await this.connection
      .getRepository(ctx, Order)
      .findOneOrFail(firstOrderId, {
        relations: ['customFields.orderGroup'],
      });

    if (isGraphQlErrorResult(order)) {
      throw order;
    }

    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    //@ts-ignore
    const orderGroup = order?.customFields?.orderGroup as OrderGroup | undefined;
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    //@ts-ignore
    const isOrderHeadOfGroup = order?.customFields?.isOrderHeadOfGroup || false;

    if (!orderGroup?.id) {
      return order;
    }

    // unlink order To group
    await this.connection.rawConnection
      .createQueryBuilder()
      .update(Order)
      .set({
        customFields: {
          orderGroup: null,
          isOrderHeadOfGroup: false,
          isAGroupMember: false,
        },
      })
      .where('id = :id', { id: order.id })
      .execute();

    // delete orderGroup ONLY if it's the head of group
    if (isOrderHeadOfGroup) {
      await this._deleteOrderGroup(ctx, orderGroup);
    }

    // aplica reajuste para aplicar promociones (si es que hay activas para la tienda)
    await this.applyPriceAdjustments(ctx, order.id);

    return this.connection.getRepository(ctx, Order).findOneOrFail(firstOrderId, {
      relations: ['customFields.orderGroup'],
    });
  }

  /**
   * Cancela un pedido grupal.
   * solo si está vacío, lo borra
   */
  async cancelOrderGroup(ctx: RequestContext, orderGroupId: ID): Promise<OrderGroup> {
    const orderGroup = await this.connection
      .getRepository(ctx, OrderGroup)
      .createQueryBuilder('ordergroup')
      .where('ordergroup.id = :id and ordergroup.channelId = :channelId', {
        id: orderGroupId,
        channelId: ctx.channelId,
      })
      .getOneOrFail();

    if (isGraphQlErrorResult(orderGroup)) {
      return orderGroup;
    }
    const countCanceled = await this._cancelOrders(ctx, orderGroupId);

    // si no tenia pedidos, borra el grupo
    if (countCanceled < 1) {
      await this._deleteOrderGroup(ctx, orderGroupId);
      orderGroup.state = 'Cancelled';
      return orderGroup;
    }

    // si tenia pedidos, transiciona a cancelado sin borrarlo
    return this._transitionFulfillmentsTo(ctx, orderGroupId, 'Cancelled', 'Cancelled');
  }

  /**
   * Cancela un pedido participante de un pedido grupal
   *
   * Solo cancela si el grupo sigue activo y si el que acciona es el dueño del grupo
   *
   */
  async cancelOrderOfOrderGroup(
    ctx: RequestContext,
    orderId: ID,
    orderGroupId: ID,
  ): Promise<ErrorResultUnion<CancelOrderOfOrderGroupResult, Order, any>> {
    let order: Order;
    let orderGroup: OrderGroup;

    try {
      order = await this.connection
        .getRepository(ctx, Order)
        .findOneOrFail(orderId, { relations: ['channels', 'customFields.orderGroup'] });

      orderGroup = await this.connection
        .getRepository(ctx, OrderGroup)
        .findOneOrFail(orderGroupId, { relations: ['customer'] });
    } catch (e) {
      return new CancelOrderOfGroupError('No tiene permiso para realizar la acción');
    }

    // validar que exista grupo y pedido participante
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    if (order.customFields?.orderGroup?.id !== orderGroup.id) {
      Logger.warn(
        `Posible hack on CancelOrderOfGroupError order for another orderGroup (orderId: ${orderId} orderGroupId: ${orderGroup.id})`,
        'OrderGroupPlugin',
      );
      return new CancelOrderOfGroupError('La orden no forma parte del pedido en grupo');
    }

    // validar que el logueado sea dueño del grupo
    if (orderGroup?.customer?.user?.id !== ctx.activeUserId) {
      Logger.warn(
        `Posible hack on CancelOrderOfGroupError not owner (orderGroupId: ${orderGroup.id} activeUserId: ${ctx.activeUserId})`,
        'OrderGroupPlugin',
      );
      return new CancelOrderOfGroupError('No tiene permiso para realizar la acción');
    }

    // validar que el grupo este activo
    if (orderGroup?.active !== true) {
      return new CancelOrderOfGroupError(
        'El grupo no está activo, no se puede cancelar un pedido participante',
      );
    }

    // validar que la orden ya no haya sido cancelada
    if (order.state === 'Cancelled') {
      return new CancelOrderOfGroupError('El pedido ya ha sido cancelado');
    }

    // aplicar cancelacion
    const cancelResult = this.orderService.cancelOrder(ctx, {
      orderId: orderId,
      cancelShipping: true,
    });

    return cancelResult;
  }

  async assignOrderToGroup(
    ctx: RequestContext,
    orderId: ID,
    orderGroupCode: string,
    alias: string,
  ): Promise<Order> {
    // Traer shippingMethod de orderGroup
    const orderGroup = await this.connection.getRepository(ctx, OrderGroup).findOne({
      where: {
        code: orderGroupCode,
      },
      relations: ['shippingLine', 'channel'],
    });

    let order = await this.connection
      .getRepository(ctx, Order)
      .findOne(orderId, { relations: ['shippingLines', 'channels', 'lines', 'surcharges'] });

    if (!orderGroup || !order) {
      throw new Error(`message.cannot-assign-order-to-ordergroup-non-found`);
    }

    // valida que pertenezcan al mismo canal
    const errorChannel = this._assertSameChannel(ctx, orderGroup, order);
    if (errorChannel) {
      throw errorChannel;
    }

    // Validar que el grupo esté activo
    if (!orderGroup.active || orderGroup.state !== 'AddingOrders') {
      throw new Error(`message.cannot-assign-order-to-ordergroup-no-actived`);
    }

    // valida que el grupo tenga shippingMethod asignado
    if (!orderGroup?.shippingMethod) {
      throw new Error(`message.cannot-assign-order-to-ordergroup-without-shippingMethod`);
    }

    // valida que la orden no sea un head de un grupo
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    if (order?.customFields?.isOrderHeadOfGroup) {
      throw new Error(`message.cannot-assign-order-to-ordergroup-that-isheadheadgroup`);
    }

    // Si la order todavia no tiene un shippingLine, usar el shippingMethod para orderId
    if (order?.shippingLines || order.shippingLines.length === 0) {
      const result = await this.orderService.setShippingMethod(ctx, orderId, orderGroup.shippingMethod.id);

      if (isGraphQlErrorResult(result)) {
        console.error(result);
        throw new Error(result.message);
      }
    }

    // Asigna el shippingAddress del Grupo
    // Asigna el FK de orderGroupId a orderId
    await this.connection.rawConnection
      .createQueryBuilder()
      .update(Order)
      .set({
        shippingAddress: orderGroup.shippingAddress,
        customFields: {
          alias,
          orderGroup: orderGroup,
          isAGroupMember: true,
        },
      })
      .where('id = :id', { id: orderId })
      .execute();

    // aplica reajuste para aplicar promociones (si es que hay activas para la tienda)
    order = await this.applyPriceAdjustments(ctx, order.id);

    return order;
  }

  async transitionToShipped(ctx: RequestContext, orderGroupId: ID): Promise<OrderGroup> {
    return this._transitionFulfillmentsTo(ctx, orderGroupId, 'Shipped', 'Shipped');
  }

  async transitionToDelivered(ctx: RequestContext, orderGroupId: ID): Promise<OrderGroup> {
    return this._transitionFulfillmentsTo(ctx, orderGroupId, 'Delivered', 'Delivered');
  }

  async _transitionFulfillmentsTo(
    ctx: RequestContext,
    orderGroupId: ID,
    toStateFulfill: FulfillmentState,
    toStateOrderGroup: OrderGroupState,
  ): Promise<OrderGroup> {
    const orderGroup = await this.connection
      .getRepository(ctx, OrderGroup)
      .createQueryBuilder('ordergroup')
      .where('ordergroup.id = :id and ordergroup.channelId = :channelId', {
        id: orderGroupId,
        channelId: ctx.channelId,
      })
      .getOneOrFail();

    if (isGraphQlErrorResult(orderGroup)) {
      return orderGroup;
    }

    const fulfills = await this.getOrderGroupFulfillments(ctx, orderGroup.id);

    const fulfill = fulfills.find(f => {
      const nextStates = this.fulfillmentService.getNextStates(f);
      return nextStates.findIndex(state => state === toStateFulfill) > -1;
    });

    if (fulfill) {
      try {
        await this.orderService.transitionFulfillmentToState(ctx, fulfill.id, toStateFulfill);
      } catch (e: any) {
        Logger.error('Error on transitionFulfillment to Delivered', 'OrderGroupPlugin', e);
      }
    }

    return this._transitionTo(ctx, orderGroupId, toStateOrderGroup);
  }

  async _transitionTo(ctx: RequestContext, orderGroupId: ID, toState: OrderGroupState): Promise<OrderGroup> {
    const orderGroup = await this.connection
      .getRepository(ctx, OrderGroup)
      .createQueryBuilder('ordergroup')
      .where('ordergroup.id = :id and ordergroup.channelId = :channelId', {
        id: orderGroupId,
        channelId: ctx.channelId,
      })
      .getOneOrFail();

    if (isGraphQlErrorResult(orderGroup)) {
      return orderGroup;
    }

    orderGroup.state = toState;
    orderGroup.active = toState === 'AddingOrders';
    return this.connection.getRepository(ctx, OrderGroup).save(orderGroup, { reload: true });
  }

  private _assertWithShippingLine(order: Order | undefined): any | undefined {
    if (
      !order ||
      !order?.shippingLines ||
      order.shippingLines.length === 0 ||
      (!order.shippingLines[0].shippingMethod && !order.shippingLines[0].shippingMethodId)
    ) {
      return new Error(`message.cannot-create-ordergroup-without-shipping-lines-or-shippingMethod`);
    }
  }

  private async _getShippingMethod(ctx: RequestContext, order: Order): Promise<ShippingMethod | undefined> {
    if (order.shippingLines[0].shippingMethod) {
      return order.shippingLines[0].shippingMethod;
    }

    const shippingMethodId = order.shippingLines[0].shippingMethodId;
    if (!shippingMethodId) {
      return;
    }

    return this.connection.getRepository(ctx, ShippingMethod).findOne(shippingMethodId);
  }

  private async _deleteOrderGroup(ctx: RequestContext, orderGroupId: ID | OrderGroup) {
    const toDelete =
      orderGroupId instanceof OrderGroup
        ? orderGroupId
        : await this.connection.getRepository(ctx, OrderGroup).findOneOrFail(orderGroupId);

    await this.connection.getRepository(ctx, OrderGroup).delete(toDelete.id);
  }

  private async _cancelOrders(ctx: RequestContext, orderGroupId: ID): Promise<number> {
    // traer ids de orders
    const ordersId = await this.connection.rawConnection
      .createQueryBuilder()
      .select('o.id', 'orderId')
      .from('order', 'o')
      .where('o.orderGroupId = :orderGroupId', { orderGroupId })
      .getRawMany();

    // cancel de a uno con servicio de order
    await Promise.all(
      ordersId.map(row => {
        return this.orderService.cancelOrder(ctx, {
          orderId: row.orderId,
          cancelShipping: true,
        });
      }),
    );

    return ordersId.length;
  }

  private _getChannel(order: Order): Channel | undefined {
    return order.channels.find(c => c.code !== DEFAULT_CHANNEL_CODE);
  }

  // Valida que la orden no este "en preparacion"
  private _assertOrderActiveState(order: Order | undefined) {
    if (!order || ALLOW_ORDER_STATES_TO_GROUP.indexOf(order.state) === -1) {
      return new Error(`message.cannot-create-ordergroup-order-not-active`);
    }
  }

  private _assertSameChannel(ctx: RequestContext, orderGroup: OrderGroup, order: Order) {
    if (ctx.channelId !== orderGroup.channel?.id || !order.channels.find(c => c.id === ctx.channelId)) {
      return new Error(`message.cannot-assign-order-to-ordergroup-another-channel`);
    }
  }

  /** aplica reajuste para aplicar promociones (si es que hay activas para la tienda) */
  private async applyPriceAdjustments(ctx: RequestContext, orderId: ID): Promise<Order> {
    const order = await this.orderService.findOne(ctx, orderId);
    if (!order || isGraphQlErrorResult(order)) {
      throw new Error(`message.cannot-assign-order-to-ordergroup-non-found`);
    }
    return this.orderService.applyPriceAdjustments(ctx, order);
  }

  private async _loadShippingMethodTranslated(
    ctx: RequestContext,
    shippingMethod: ShippingMethod,
  ): Promise<ShippingMethod> {
    const sm = await this.connection.getRepository(ctx, ShippingMethod).findOneOrFail(shippingMethod?.id);
    return this.translator.translate(sm, ctx);
  }
}
export default OrderGroupService;
