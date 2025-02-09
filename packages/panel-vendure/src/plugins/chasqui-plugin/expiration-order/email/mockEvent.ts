import {
  AdjustmentType,
  Customer,
  Order,
  OrderItem,
  OrderLine,
  ProductVariant,
  RequestContext,
  ShippingLine,
} from '@vendure/core';
import { ExpirationOrderEvent } from './../events/ExpirationOrderEvent';

export const mockExpirationOrderEvent = new ExpirationOrderEvent(
  RequestContext.empty(),
  new Order({
    id: '6',
    createdAt: '2018-10-31T11:18:29.261Z',
    updatedAt: '2018-10-31T15:24:17.000Z',
    orderPlacedAt: '2018-10-31T13:54:17.000Z',
    code: 'T3EPGJKTVZPBD6Z9',
    state: 'ArrangingPayment',
    active: true,
    customer: new Customer({
      id: '3',
      firstName: 'Test',
      lastName: 'Customer',
      emailAddress: 'test@test.com',
    }),
    lines: [
      new OrderLine({
        id: '5',
        featuredAsset: {
          preview: '/mailbox/placeholder-image',
        },
        productVariant: new ProductVariant({
          id: '2',
          name: 'Curvy Monitor 24 inch',
          sku: 'C24F390',
        }),
        items: [
          new OrderItem({
            id: '6',
            listPrice: 14374,
            listPriceIncludesTax: true,
            adjustments: [
              {
                adjustmentSource: 'Promotion:1',
                type: AdjustmentType.PROMOTION,
                amount: -1000,
                description: '$10 off computer equipment',
              },
            ],
            taxLines: [],
          }),
        ],
      }),
      new OrderLine({
        id: '6',
        featuredAsset: {
          preview: '/mailbox/placeholder-image',
        },
        productVariant: new ProductVariant({
          id: '4',
          name: 'Hard Drive 1TB',
          sku: 'IHD455T1',
        }),
        items: [
          new OrderItem({
            id: '7',
            listPrice: 3799,
            listPriceIncludesTax: true,
            adjustments: [],
            taxLines: [],
          }),
        ],
      }),
    ],
    subTotal: 15144,
    subTotalWithTax: 18173,
    shipping: 1000,
    shippingLines: [
      new ShippingLine({
        listPrice: 1000,
        listPriceIncludesTax: true,
        taxLines: [{ taxRate: 20, description: 'shipping tax' }],
        shippingMethod: {
          code: 'express-flat-rate',
          name: 'Express Shipping',
          description: 'Express Shipping',
          id: '2',
        },
      }),
    ],
    surcharges: [],
    shippingAddress: {
      fullName: 'Test Customer',
      company: '',
      streetLine1: '6000 Pagac Land',
      streetLine2: '',
      city: 'Port Kirsten',
      province: 'Avon',
      postalCode: 'ZU32 9CP',
      country: 'Cabo Verde',
      phoneNumber: '',
    },
    payments: [],
  }),
);
