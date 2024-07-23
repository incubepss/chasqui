import { gql } from 'apollo-angular';

import { CART_FRAGMENT, ERROR_RESULT_FRAGMENT } from '../../../common/graphql/fragments.graphql';

export const APPLY_PROMOTION_CODE = gql`
  mutation TransitionToAddingItems($couponCode: String!) {
    applyCouponCode(couponCode: $couponCode) {
      ...Cart
      ...ErrorResult
    }
  }
  ${CART_FRAGMENT}
  ${ERROR_RESULT_FRAGMENT}
`;
