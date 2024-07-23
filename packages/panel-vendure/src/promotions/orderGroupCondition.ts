import { LanguageCode, PromotionCondition } from '@vendure/core';

export const orderGroupParticipantCondition = new PromotionCondition({
  code: 'orderGroup_participant',

  description: [{ languageCode: LanguageCode.es, value: 'Pedido participa de una compra en grupo' }],

  args: {},

  check(ctx, order) {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    return order.customFields?.isAGroupMember === true;
  },
});
