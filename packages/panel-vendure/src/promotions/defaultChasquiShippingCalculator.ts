import { LanguageCode, ShippingCalculator } from '@vendure/core';

export const defaultChasquiShippingCalculator = new ShippingCalculator({
  // importante!: mantener mismo codigo que el calculador por defecto de vendure, asi no es necesario una migración
  code: 'default-shipping-calculator',
  description: [{ languageCode: LanguageCode.es, value: 'Calculador de envio por defecto' }],
  args: {
    rate: {
      type: 'int',
      defaultValue: 0,
      ui: { component: 'currency-form-input' },
      label: [{ languageCode: LanguageCode.es, value: 'Costo de entrega' }],
    },
  },
  calculate: (ctx, order, args) => {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    const isOnlyParticipante = order.customFields?.isAGroupMember && !order.customFields?.isOrderHeadOfGroup;
    return {
      // gratis is es participante de una compra grupal
      price: isOnlyParticipante ? 0 : args.rate,
      taxRate: 0,
      priceIncludesTax: true,
    };
  },
});
