import { gql } from 'apollo-angular';

import {
  CART_FRAGMENT,
  ERROR_RESULT_FRAGMENT,
  INSUFFICIENT_STOCK_ERROR,
} from '../../../common/graphql/fragments.graphql';

export const ADJUST_ITEM_QUANTITY = gql`
  mutation AdjustItemQuantity($id: ID!, $qty: Int!) {
    adjustOrderLine(orderLineId: $id, quantity: $qty) {
      ...Cart
      ...ErrorResult
      ...InsufficientStockError
    }
  }
  ${CART_FRAGMENT}
  ${ERROR_RESULT_FRAGMENT}
  ${INSUFFICIENT_STOCK_ERROR}
`;

export const REMOVE_ITEM_FROM_CART = gql`
  mutation RemoveItemFromCart($id: ID!) {
    removeOrderLine(orderLineId: $id) {
      ...Cart
      ...ErrorResult
    }
  }
  ${CART_FRAGMENT}
  ${ERROR_RESULT_FRAGMENT}
`;

export const REMOVE_ALL_ITEM_FROM_CART = gql`
  mutation RemoveAllItems {
    removeAllOrderLines {
      ...Cart
      ...ErrorResult
    }
  }
  ${CART_FRAGMENT}
  ${ERROR_RESULT_FRAGMENT}
`;

export const REMOVE_COUPON_CODE = gql`
  mutation RemoveCouponCode($couponCode: String!) {
    removeCouponCode(couponCode: $couponCode) {
      couponCodes
    }
  }
`;
