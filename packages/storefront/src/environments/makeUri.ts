import { ServerConfig } from '../app/app.config';

export const makeUri = (environment: ServerConfig): string => {
  let uri = '';

  if (!environment) {
    return uri;
  }

  const { apiHost, apiPort, shopApiPath } = environment;

  if (!apiHost) {
    uri = location.protocol + '//' + location.host;
  } else {
    uri = apiHost;
  }

  if (apiPort) {
    uri += `:${apiPort}`;
  }

  return `${uri}/${shopApiPath}`;
};
