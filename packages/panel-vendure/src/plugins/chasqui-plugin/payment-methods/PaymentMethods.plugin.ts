import { PluginCommonModule, VendurePlugin, CustomFieldConfig, LanguageCode } from '@vendure/core';
import { shopApiExtensions } from './api/api-extension';
import { PaymentResolver } from './api/Payment.resolver';
import { PaymentMethodResolver } from './api/PaymentMethod.resolver';

const customFields: Array<CustomFieldConfig> = [
  {
    name: 'paymentInstruction',
    type: 'text',
    list: false,
    label: [{ languageCode: LanguageCode.es, value: 'Instrucción para el pago' }],
  },
];

@VendurePlugin({
  imports: [PluginCommonModule],
  shopApiExtensions: {
    schema: shopApiExtensions,
    resolvers: [PaymentResolver, PaymentMethodResolver],
  },
  configuration: config => {
    config.customFields.PaymentMethod = config.customFields.PaymentMethod.concat(customFields);
    return config;
  },
})
export class PaymentMethodsPlugin {}
