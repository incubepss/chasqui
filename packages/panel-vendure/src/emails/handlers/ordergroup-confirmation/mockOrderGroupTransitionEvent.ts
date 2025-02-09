import { Channel, CurrencyCode, Customer, LanguageCode } from '@vendure/core';

import { OrderGroup } from '../../../plugins/chasqui-plugin/order-group/entities/order-group.entity';
import { OrderGroupStateTransitionEvent } from '../../../plugins/chasqui-plugin/order-group/entities/ordergroup-state-transition-event';

export const mockOrderGroupConfimedEvent = new OrderGroupStateTransitionEvent(
  'AddingOrders',
  'ConfirmedByOwner',
  {} as any,
  new OrderGroup({
    currencyCode: 'ARS',
    totalQuantity: 0,
    shipping: 0,
    shippingWithTax: 0,
    subTotal: 0,
    subTotalWithTax: 0,
    total: 0,
    totalWithTax: 0,
    ordersQuantity: 0,
    createdAt: '2022-07-26T13:46:14.730Z',
    updatedAt: '2022-07-26T13:46:36.647Z',
    alias: 'mercadotransformador-g-asg6',
    code: 'mercadotransformador-g-asg6',
    state: 'ConfirmedByOwner',
    orderPlacedAt: '2022-07-26T13:46:36.640Z',
    active: false,
    shippingAddress: {
      fullName: 'juan invitado',
      company: '',
      streetLine1: 'artigas 224 piso 5',
      streetLine2: '',
      city: 'fiske',
      province: 'Río Negro',
      postalCode: '8332',
      countryCode: 'AR',
      phoneNumber: '1166772615',
      country: 'Argentina',
    },
    billingAddress: null,
    id: 73,
    customer: new Customer({
      createdAt: '2021-12-14T14:52:15.294Z',
      updatedAt: '2022-06-01T16:08:59.480Z',
      deletedAt: null,
      title: '',
      firstName: 'Juan',
      lastName: 'Perez',
      phoneNumber: '6982675',
      emailAddress: 'juanperez@chasqui.ar',
      id: 1,
    }),
    channel: new Channel({
      token: 'mercadotransformador',
      createdAt: '2022-03-31T17:36:07.105Z',
      updatedAt: '2022-07-14T13:23:44.091Z',
      code: 'Mercado transformador',
      defaultLanguageCode: LanguageCode.es,
      currencyCode: CurrencyCode.ARS,
      pricesIncludeTax: true,
      id: 14,
      customFields: {
        showOnMultitienda: true,
        nombre: 'Mercado transformador',
        zoneStore: 'en algun sitio del pais',
        cityStore: null,
        provinceStore: 'Buenos Aires',
        description: null,
        geolocationStore: null,
        bgColorStore: null,
        storeEnabled: true,
        messageStoreDisabled: null,
        emailStore: null,
        scheduleStore: null,
        phoneStore: null,
        telegramStore: null,
        whatsappStore: null,
        rrssStore: null,
        bodyAboutUs: null,
        fromAddress: 'dev.mtransforamdor@proyectowow.com.ar',
      },
    }),
  }),
);

export default mockOrderGroupConfimedEvent;
