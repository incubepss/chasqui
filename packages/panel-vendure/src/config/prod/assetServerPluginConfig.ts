import { ROUTES } from '../common/routes';
import assetServerPluginConfig from '../common/assetServerPluginConfig';

const env = process.env;

assetServerPluginConfig.assetUrlPrefix = env.ASSET_URL_PREFIX || `/${ROUTES.assetPath}/`;

export default assetServerPluginConfig;
