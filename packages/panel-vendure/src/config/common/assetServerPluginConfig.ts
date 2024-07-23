import path from 'path';
import { Channel, RequestContext } from '@vendure/core';
import dotenv from 'dotenv';
import { AssetServerOptions } from '@vendure/asset-server-plugin';
import { HashedAssetNamingStrategy } from '@vendure/asset-server-plugin/lib/src/hashed-asset-naming-strategy';
import { ROUTES } from './routes';
dotenv.config();

const env = process.env;

class ByChannelsStrategy extends HashedAssetNamingStrategy {
  _contextChannel: Channel;

  /**
   * This is usefull for the plugin importer-chasqui1
   */
  setContextImportChannel(channel: Channel) {
    this._contextChannel = channel;
  }

  generateSourceFileName(ctx: RequestContext, originalFileName: string, conflictFileName?: string): string {
    const filename = super.generateSourceFileName(ctx, originalFileName, conflictFileName);
    const base = this.getBaseChannelFolder(ctx);
    return path.join(base, filename);
  }
  generatePreviewFileName(ctx: RequestContext, originalFileName: string, conflictFileName?: string): string {
    const filename = super.generatePreviewFileName(ctx, originalFileName, conflictFileName);
    const base = this.getBaseChannelFolder(ctx);
    return path.join(base, filename);
  }

  private getBaseChannelFolder(ctx: RequestContext): string {
    const channelId = ctx?.channelId || this._contextChannel?.id;
    return channelId ? `channel-${channelId}` : '';
  }
}

const assetServerPluginConfig: AssetServerOptions = {
  route: ROUTES.assetPath,
  assetUploadDir: path.join(__dirname, '../../../static/assets'),
  namingStrategy: new ByChannelsStrategy(),
  assetUrlPrefix: env.ASSET_URL_PREFIX || `/${ROUTES.assetPath}/`,
};

export default assetServerPluginConfig;
