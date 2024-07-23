import { Asset, TransactionalConnection, Injector, RequestContext } from '@vendure/core';
import dotenv from 'dotenv';

dotenv.config();
const env = process.env;

export async function findChannelLogo(ctx: RequestContext, injector: Injector): Promise<string> {
  const connection = injector.get(TransactionalConnection);
  const asset = await connection
    .getRepository(Asset)
    .createQueryBuilder('Asset')
    .select('Asset')
    .innerJoin('channel', 'channel', 'channel.imgLogoId = Asset.id')
    .where('channel.id = :idChannel', { idChannel: ctx.channelId })
    .getOne();

  if (asset) {
    return `${env.ASSET_URL_BASE}/${asset.preview}`;
  }

  return '';
}
