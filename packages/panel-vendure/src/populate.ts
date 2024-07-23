/* eslint-disable */
import * as path from 'path';
import { bootstrap, LanguageCode } from '@vendure/core';
import { populate } from '@vendure/core/cli';
import { config } from './vendure-config';

let initialData = {
  defaultLanguage: LanguageCode.es,
  countries: [{ name: 'Argentina', code: 'AR', zone: 'Federal' }],
  defaultZone: 'Federal',
  taxRates: [
    { name: 'IVA reducido I (21%)', percentage: 21 },
    { name: 'IVA reducido II (10.5%)', percentage: 10.5 },
  ],
  shippingMethods: [],
  paymentMethods: [],
  collections: []
};

populate(() => bootstrap(config), initialData)
  .then(app => {
    return app.close();
  })
  .then(
    () => process.exit(0),
    err => {
      console.log(err);
      process.exit(1);
    },
  );
