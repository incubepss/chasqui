import { PluginCommonModule, VendurePlugin, LanguageCode, CustomFieldConfig } from '@vendure/core';
import { shopApiExtensions } from './api/api-extension';
import { ShippingShopApiResolver } from './api/shipping.resolver';

const customFields: Array<CustomFieldConfig> = [
  {
    name: 'typeDelivery',
    type: 'string',
    list: false,
    defaultValue: 'showroom',
    label: [{ languageCode: LanguageCode.es, value: 'Tipo de entrega' }],
    options: [
      {
        value: 'showroom',
        label: [{ languageCode: LanguageCode.es, value: 'Retiro en punto de entrega' }],
      },
      { value: 'shipping', label: [{ languageCode: LanguageCode.es, value: 'Envío a domicilio' }] },
    ],
  },
  {
    name: 'address_or_places',
    type: 'string',
    label: [{ languageCode: LanguageCode.es, value: 'Dirección o barrios' }],
    list: false,
  },
  {
    name: 'schedule',
    type: 'string',
    label: [{ languageCode: LanguageCode.es, value: 'Horarios' }],
    list: false,
  },
  {
    name: 'geolocation',
    type: 'text',
    label: [{ languageCode: LanguageCode.es, value: 'Geo-locacalización' }],
    list: false,
    ui: { component: 'geolocation-input', mode: 'point' },
  },
];

@VendurePlugin({
  imports: [PluginCommonModule],
  configuration: config => {
    config.customFields.ShippingMethod = config.customFields.ShippingMethod.concat(customFields);
    return config;
  },
  shopApiExtensions: {
    schema: shopApiExtensions,
    resolvers: [ShippingShopApiResolver],
  },
})
export class ShippingPlugin {}
