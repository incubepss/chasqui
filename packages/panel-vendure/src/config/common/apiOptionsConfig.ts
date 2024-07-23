import dotenv from 'dotenv';
import { ApiOptions } from '@vendure/core';
import { json } from 'body-parser';
import { ROUTES } from './routes';
import { NonVerboseErrorsPlugin } from './NonVerboseErrorsPlugin';

dotenv.config();

const env = process.env;

const ENABLED_GRAPHQL_PLAYGROUND: boolean = env.ENABLED_GRAPHQL_PLAYGROUND === 'true' || false;

const apiOptionsConfig: ApiOptions = {
  port: 3000,
  adminApiPath: ROUTES.adminApiPath,
  adminApiPlayground: ENABLED_GRAPHQL_PLAYGROUND && {
    settings: {
      'request.credentials': 'include',
    },
  },
  adminApiDebug: false,
  shopApiPath: 'shop-api',
  shopApiPlayground: ENABLED_GRAPHQL_PLAYGROUND && {
    settings: {
      'request.credentials': 'include',
    },
  },
  shopApiDebug: false,
  introspection: ENABLED_GRAPHQL_PLAYGROUND,
  apolloServerPlugins: [new NonVerboseErrorsPlugin()],
  middleware: [
    {
      handler: json({ limit: '1mb' }),
      route: '*',
      beforeListen: true,
    },
  ],
};

export default apiOptionsConfig;
