import { bootstrapWorker } from '@vendure/core';

import { config } from './vendure-config';
import { ExpirationOrderPlugin } from './plugins/chasqui-plugin/expiration-order/ExpirationOrder.plugin';

config.plugins?.push(ExpirationOrderPlugin);

bootstrapWorker(config)
  .then(worker => worker.startJobQueue())
  .then(worker => worker.startHealthCheckServer({ port: 3020, route: '/admin-health' }))
  .catch(err => {
    // eslint:disable-next-line:no-console
    console.log(err);
  });

process.on('SIGINT', function () {
  console.log('\nHasta Luego!');

  process.exit();
});
