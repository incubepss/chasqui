import { Args, Query, Resolver, Mutation } from '@nestjs/graphql';
import {
  Allow,
  Ctx,
  RequestContext,
  Transaction,
  TransactionalConnection,
  ProductService,
  Permission,
} from '@vendure/core';

import { assignProductorInput, deleteProductorInput, QueryAdministratorArgs } from '../generated-types';

import { Productor } from '../entities/productor.entity';

import { crudProductorPermission } from '../productor-permission';
import { ProductorService } from './../services/ProductorService';

@Resolver()
export class ProductorResolver {
  constructor(
    private connection: TransactionalConnection,
    private productService: ProductService,
    private productorService: ProductorService,
  ) {}

  @Query()
  @Allow(crudProductorPermission.Read)
  async productores(@Ctx() ctx: RequestContext, @Args() args: any) {
    return this.productorService.findAll(ctx, args.options || undefined) || [];
  }

  @Query()
  @Allow(crudProductorPermission.Read)
  productor(@Ctx() ctx: RequestContext, @Args() args: QueryAdministratorArgs) {
    return this.connection.getRepository(ctx, Productor).findOne(args.id);
  }

  @Transaction()
  @Mutation()
  @Allow(crudProductorPermission.Create)
  async addProductor(@Ctx() ctx: RequestContext, @Args() { input }: any) {
    return this.productorService.create(ctx, input);
  }

  @Transaction()
  @Mutation()
  @Allow(crudProductorPermission.Update)
  async updateProductor(@Ctx() ctx: RequestContext, @Args() { input }: any) {
    return this.productorService.update(ctx, input);
  }

  @Transaction()
  @Mutation()
  @Allow(crudProductorPermission.Delete)
  async deleteProductor(@Ctx() ctx: RequestContext, @Args() { id }: deleteProductorInput) {
    const productor = await this.productorService.deleteProductor(ctx, id);
    return productor;
  }

  @Transaction()
  @Mutation()
  @Allow(Permission.UpdateCatalog)
  async assignProductor(
    @Ctx() ctx: RequestContext,
    @Args() { idProducto, idProductor }: assignProductorInput,
  ) {
    const productor = await this.connection.getEntityOrThrow(ctx, Productor, idProductor);
    const response = await this.productService.update(ctx, {
      id: idProducto,
      customFields: { productor },
    });

    if (response) {
      return 'Productor asignado a producto actualizado correctamente';
    }
    return 'Occurio un error al asignar el productor al producto.';
  }
}

@Resolver()
export class ProductorShopResolver {
  constructor(private connection: TransactionalConnection, private productorService: ProductorService) {}

  @Query()
  async productores(@Ctx() ctx: RequestContext, @Args() args: any) {
    args.options = {
      ...args.options,
      filter: {
        ...(args.options?.filter || {}),
        enabled: { eq: true },
      },
    };
    return this.productorService.findAll(ctx, args.options || undefined) || [];
  }

  @Query()
  productor(@Ctx() ctx: RequestContext, @Args() args: QueryAdministratorArgs) {
    return this.connection.getRepository(ctx, Productor).findOne(args.id);
  }
}
