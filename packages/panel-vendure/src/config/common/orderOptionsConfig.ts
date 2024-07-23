import { OrderOptions, CustomOrderProcess } from '@vendure/core';

const chasquiOrderFlow: CustomOrderProcess<
  'AddingItems' | 'PaymentAuthorized' | 'WithFulfill' | 'Expired' | 'Cancelled'
> = {
  transitions: {
    AddingItems: {
      to: ['Expired'],
      mergeStrategy: 'merge',
    },
    ArrangingPayment: {
      to: ['WithFulfill'],
      mergeStrategy: 'merge',
    },
    PaymentAuthorized: {
      to: ['PartiallyDelivered', 'Delivered', 'PartiallyShipped', 'Shipped', 'WithFulfill'],
      mergeStrategy: 'merge',
    },
    PaymentSettled: {
      to: ['WithFulfill'],
      mergeStrategy: 'merge',
    },
    Modifying: {
      to: ['WithFulfill'],
      mergeStrategy: 'merge',
    },
    WithFulfill: {
      to: [
        'PartiallyDelivered',
        'Delivered',
        'PartiallyShipped',
        'Shipped',
        'Cancelled',
        'Modifying',
        'ArrangingAdditionalPayment',
      ],
    },
    ArrangingAdditionalPayment: {
      to: ['WithFulfill'],
      mergeStrategy: 'merge',
    },
    Cancelled: {
      to: ['Expired'],
      mergeStrategy: 'merge',
    },
    Expired: {
      to: [],
    },
  },
};

export const orderOptions: OrderOptions = {
  process: [chasquiOrderFlow],
};
