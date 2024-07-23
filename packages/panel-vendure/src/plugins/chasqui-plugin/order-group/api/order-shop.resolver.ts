import { Mutation, Args, Resolver, Query } from '@nestjs/graphql';
import {
  Ctx,
  RequestContext,
  TransactionalConnection,
  ListQueryBuilder,
  Allow,
  Permission,
  PaginatedList,
  Order,
  ActiveOrderService,
  ErrorResultUnion,
  Transaction,
  RelationPaths,
  Relations,
  ConfigService,
  ForbiddenError,
  LogLevel,
  OrderService,
} from '@vendure/core';
import { unique } from '@vendure/common/lib/unique';
import { NoActiveOrderError } from '@vendure/core/dist/common/error/generated-graphql-shop-errors';
import { ActiveOrderResult, QueryOrderByCodeArgs } from '@vendure/common/lib/generated-shop-types';
import { OrderGroup } from '../entities/order-group.entity';

import OrderGroupService from '../services/OrderGroupService';

@Resolver()
export class OrderShopResolver {
  constructor(
    private connection: TransactionalConnection,
    private listQueryBuilder: ListQueryBuilder,
    private orderService: OrderService,
    private orderGroupService: OrderGroupService,
    private activeOrderService: ActiveOrderService,
    private configService: ConfigService,
  ) {}

  /**
   * codigo original de vendure shop-order.resolver.ts
   *
   * Se necesita darle permiso de lectura al dueño del grupo para que pueda
   * ver pedidos individuales.
   *
   * Se intento hacer un OrderByCodeAccessStrategy, pero no se llega tener el dato necesario.
   *
   * Buscar mejor enfoque para el futuro
   */
  @Query()
  @Allow(Permission.Owner)
  async orderByCode(
    @Ctx() ctx: RequestContext,
    @Args() args: QueryOrderByCodeArgs,
    @Relations(Order) relations: RelationPaths<Order>,
  ): Promise<Order | undefined> {
    if (ctx.authorizedAsOwnerOnly) {
      const requiredRelations: RelationPaths<Order> = ['customer', 'customer.user'];
      const order = await this.orderService.findOneByCode(
        ctx,
        args.code,
        unique([...relations, ...requiredRelations]),
      );

      if (
        order &&
        (await this.configService.orderOptions.orderByCodeAccessStrategy.canAccessOrder(ctx, order))
      ) {
        return order;
      }

      if (order && (await this.orderGroupService.isActiveUserOwnerGroupForOrder(ctx, order.id))) {
        return order;
      }

      // SE CAMBIA EL ENFOQUE QUE VIENE DEL CORE, EN VEZ DE TIRAR ERROR DE PERMISO,
      // SI NO HAY PERMISO, RETORNA undefined COMO SI NO EXISTIERA
      // We throw even if the order does not exist, since giving a different response
      // opens the door to an enumeration attack to find valid order codes.
      //throw new ForbiddenError(LogLevel.Verbose);
    }
  }
}
