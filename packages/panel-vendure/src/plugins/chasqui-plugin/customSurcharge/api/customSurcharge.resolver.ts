import { Args, Query, Resolver, Mutation } from '@nestjs/graphql';
import { Ctx, RequestContext, Transaction, ActiveOrderService, Allow } from '@vendure/core';

import { CustomSurchargeService } from '../services/customSurcharge.service';
import { crudCustomSurchargePermission } from '../customSurcharge-permission';

@Resolver()
export class CustomSurchargeResolver {
  constructor(private customSurchargeService: CustomSurchargeService) {}

  @Query()
  @Allow(crudCustomSurchargePermission.Read)
  async customSurcharges(@Ctx() ctx: RequestContext) {
    return this.customSurchargeService.findAll(ctx) || [];
  }

  @Query()
  @Allow(crudCustomSurchargePermission.Read)
  customSurcharge(@Ctx() ctx: RequestContext, @Args() { id }: any) {
    return this.customSurchargeService.findOne(ctx, id);
  }

  @Transaction()
  @Mutation()
  @Allow(crudCustomSurchargePermission.Create)
  async addCustomSurcharge(@Ctx() ctx: RequestContext, @Args() { input }: any) {
    return this.customSurchargeService.create(ctx, input);
  }

  @Transaction()
  @Mutation()
  @Allow(crudCustomSurchargePermission.Update)
  async updateCustomSurcharge(@Ctx() ctx: RequestContext, @Args() { input }: any) {
    return this.customSurchargeService.update(ctx, input);
  }

  @Transaction()
  @Mutation()
  @Allow(crudCustomSurchargePermission.Delete)
  deleteCustomSurcharge(@Ctx() ctx: RequestContext, @Args() { id }: any) {
    return this.customSurchargeService.remove(ctx, id);
  }
}

@Resolver()
export class CustomSurchargeResolverShopResolver {
  constructor(
    private customSurchargeService: CustomSurchargeService,
    private activeOrderService: ActiveOrderService,
  ) {}

  @Query()
  async customSurcharges(@Ctx() ctx: RequestContext) {
    return (
      this.customSurchargeService.findAll(ctx, {
        filter: {
          enabled: { eq: true },
        },
      }) || []
    );
  }

  @Transaction()
  @Mutation()
  async useCustomSurchargeOptionOnOrder(@Ctx() ctx: RequestContext, @Args() { input }: any) {
    const order = await this.activeOrderService.getOrderFromContext(ctx, true);
    const option = await this.customSurchargeService.findOneOption(ctx, input.id);

    if (!order || !option) {
      return order;
    }

    return this.customSurchargeService.useOptionOnOrder(ctx, order, option);
  }
}
