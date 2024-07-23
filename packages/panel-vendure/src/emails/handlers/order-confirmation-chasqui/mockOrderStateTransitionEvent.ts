import { mockOrderStateTransitionEvent as mock } from '@vendure/email-plugin/lib/src/mock-events';

const payments = [
  {
    createdAt: '2022-03-11T14:52:30.306Z',
    updatedAt: '2022-03-11T14:52:30.306Z',
    method: 'payment-manual',
    amount: 129000,
    state: 'Authorized',
    errorMessage: null,
    transactionId: null,
    metadata: { comments: '' },
    id: 149,
    refunds: [],
    paymentMethod: {
      createdAt: '2022-01-25T16:10:43.291Z',
      updatedAt: '2022-03-08T18:21:27.671Z',
      name: 'Transferencia Bancaria',
      code: 'payment-manual',
      description: '<p>Paga por transferencia bancaria con cualquier banco</p>',
      enabled: true,
      checker: null,
      handler: [Object],
      id: 4,
      customFields: {
        paymentInstruction:
          'Realiza tranferencia a la siguiente cuenta:\n \n CBU: 4354334543534\n Alias:  lamu\n \n Luego mandá el comprobante del pago:\n - Por $email \n  - Por $whatsapp',
      },
    },
  },
];

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
mock.order.payments = payments;

export const mockOrderStateTransitionEvent = mock;
