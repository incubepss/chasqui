import { DEFAULT_CHANNEL_CODE } from '@vendure/common/lib/shared-constants';
import { Injectable } from '@nestjs/common';
import { Channel, RequestContext, TransactionalConnection } from '@vendure/core';

@Injectable()
export class MultitiendaService {
  constructor(private connection: TransactionalConnection) {}

  findAllActive(ctx: RequestContext): Promise<Channel[]> {
    return (
      this.connection
        .getRepository(ctx, Channel)
        .createQueryBuilder('channel')
        //.where('channel.customFieldsShowonmultitienda = true')
        .andWhere('channel.code != :defaultCodeChannel', { defaultCodeChannel: DEFAULT_CHANNEL_CODE })
        .addOrderBy('channel.customFieldsProvincestore')
        .addOrderBy('channel.code')
        .getMany()
    );
  }
}
