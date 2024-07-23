import { defaultPromotionConditions, PromotionOptions } from '@vendure/core';
import { orderGroupParticipantCondition } from '../../promotions/orderGroupCondition';

export const promotionOptions: PromotionOptions = {
  promotionConditions: [...defaultPromotionConditions, orderGroupParticipantCondition],
};

export default promotionOptions;
