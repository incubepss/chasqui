import { Args, Resolver, Mutation } from '@nestjs/graphql';
import { Allow, Ctx, Permission, RequestContext } from '@vendure/core';
import { CreatorMultitiendaService } from '../services/creatormultitienda.service';

@Resolver()
export class AdminResolver {
  constructor(private creatorService: CreatorMultitiendaService) {}

  @Mutation()
  @Allow(Permission.SuperAdmin, Permission.CreateChannel)
  async createTienda(@Ctx() ctx: RequestContext, @Args() { input }: any) {
    return this.creatorService.create(ctx, input);
  }
}
