/* eslint-disable @typescript-eslint/ban-ts-comment */
import { Args, Resolver, Mutation } from '@nestjs/graphql';
import {
  Ctx,
  RequestContext,
  Transaction,
  Allow,
  ChannelService,
  Permission,
  ErrorResultUnion,
  isGraphQlErrorResult,
} from '@vendure/core';

import { Channel, MutationUpdateChannelArgs, UpdateChannelResult } from '@vendure/common/lib/generated-types';

@Resolver('Channel')
export class ChannelConfigResolver {
  constructor(private channelService: ChannelService) {}

  @Transaction()
  @Mutation()
  @Allow(Permission.UpdateChannel)
  async updateChannel(
    @Ctx() ctx: RequestContext,
    @Args() args: MutationUpdateChannelArgs,
  ): Promise<ErrorResultUnion<UpdateChannelResult, Channel>> {
    const result = await this.channelService.update(ctx, args.input);
    if (isGraphQlErrorResult(result)) {
      return result;
    }
    // @ts-ignore
    return result;
  }
}
