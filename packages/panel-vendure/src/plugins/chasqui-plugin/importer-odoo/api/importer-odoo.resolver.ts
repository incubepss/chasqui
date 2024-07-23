import { Resolver, Query, Mutation, Args } from '@nestjs/graphql';
import { Ctx, RequestContext, Allow, Transaction } from '@vendure/core';
import { odooConnect } from '../constants';
import { ImporterOdooService } from '../services/importer-odoo.service';
import { OdooService } from './../services/odoo.service';

@Resolver()
export class ImporterOdooResolver {
  constructor(private odooService: OdooService, private importerOdooService: ImporterOdooService) {}

  @Query()
  @Allow(odooConnect.Read)
  async getOdooProducts(@Ctx() ctx: RequestContext) {
    return this.odooService.getOdooProducts(ctx);
  }

  @Transaction()
  @Mutation()
  @Allow(odooConnect.Create)
  async importProductsOdooToChannel(@Ctx() ctx: RequestContext, @Args() { odooProducts }: any) {
    await this.importerOdooService.importProductsOdooToChannel(ctx, odooProducts);
    return 'Estamos importanto los productos.';
  }

  @Mutation()
  @Allow(odooConnect.Create)
  async exportOrderToOdoo(@Ctx() ctx: RequestContext, @Args('orderId') orderId: string) {
    return this.odooService.exportOrderToOdoo(ctx, orderId);
  }
}
