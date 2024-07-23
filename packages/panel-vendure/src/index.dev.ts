import { bootstrap } from '@vendure/core';
import { config } from './vendure-config.dev';

bootstrap(config).catch(err => {
  // eslint:disable-next-line:no-console
  console.log(err);
});

process.on('SIGINT', function () {
  console.log('\nHasta Luego!');

  process.exit();
});
