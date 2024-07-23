import { PaymentMethodHandler, CreatePaymentResult, LanguageCode } from '@vendure/core';

/**
 * This is a handler which integrates Vendure with an imaginary
 * payment provider, who provide a Node SDK which we use to
 * interact with their APIs.
 */
export const PaymentManual = new PaymentMethodHandler({
  code: 'payment-manual',
  description: [
    {
      languageCode: LanguageCode.es,
      value: 'Gestor manual',
    },
  ],
  args: {},

  /** This is called when the `addPaymentToOrder` mutation is executed */
  createPayment: async (ctx, order, amount, args, metadata): Promise<CreatePaymentResult> => {
    return {
      amount: order.totalWithTax,
      state: 'Authorized' as const,
      metadata: {
        comments: metadata.comments,
      },
    };
  },

  /** This is called when the `settlePayment` mutation is executed */
  settlePayment() {
    return {
      success: true,
    };
  },
});
