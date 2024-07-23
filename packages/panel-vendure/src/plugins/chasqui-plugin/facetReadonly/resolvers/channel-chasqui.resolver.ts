import { Args, Mutation, Resolver } from '@nestjs/graphql';
import {
  CreateChannelResult,
  MutationCreateChannelArgs,
  Permission,
} from '@vendure/common/lib/generated-types';
import {
  Channel,
  ChannelService,
  ErrorResultUnion,
  isGraphQlErrorResult,
  RoleService,
  RequestContext,
  Ctx,
  Allow,
  Transaction,
  Logger,
} from '@vendure/core';
import { ChannelResolver } from '@vendure/core/dist/api/resolvers/admin/channel.resolver';

import { FacetReadonlyService } from '../services/FacetReadonly.service';

@Resolver('Channel')
export class ChannelChasquiResolver extends ChannelResolver {
  constructor(
    _channelService: ChannelService,
    _roleService: RoleService,
    private facetReadonlyService: FacetReadonlyService,
  ) {
    super(_channelService, _roleService);
  }

  @Transaction()
  @Mutation()
  @Allow(Permission.SuperAdmin)
  async createChannel(
    @Ctx() ctx: RequestContext,
    @Args() args: MutationCreateChannelArgs,
  ): Promise<ErrorResultUnion<CreateChannelResult, Channel>> {
    const result = await super.createChannel(ctx, args);
    if (isGraphQlErrorResult(result)) {
      return result;
    }
    Logger.info(`Created a new channel ${result.id}`, 'FacetReadonlyPlugin');
    await this.facetReadonlyService.assignFacetsRoToChannel(ctx, result.id);
    return result;
  }
}
