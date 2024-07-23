import { gql } from 'apollo-angular';

import {
  CART_FRAGMENT,
  ORDER_ADDRESS_FRAGMENT,
  PAYMENT_FRAGMENT,
} from '../../../common/graphql/fragments.graphql';

export const GET_ORDER = gql`
  query GetOrder($code: String!) {
    orderByCode(code: $code) {
      ...Cart
      orderPlacedAt
      state
      shippingLines {
        shippingMethod {
          customFields {
            typeDelivery
            address_or_places
            schedule
          }
        }
      }
      shippingAddress {
        ...OrderAddress
      }
      billingAddress {
        ...OrderAddress
      }
      payments {
        ...Payment
        paymentMethod {
          id
          name
          description
          customFields {
            paymentInstruction
          }
        }
        metadata
      }
      customer {
        firstName
        lastName
        phoneNumber
        emailAddress
      }
      customFields {
        alias
        orderGroup {
          id
          code
          alias
          state
          active
        }
      }
    }
  }
  ${CART_FRAGMENT}
  ${ORDER_ADDRESS_FRAGMENT}
  ${PAYMENT_FRAGMENT}
`;

export const CANCEL_ORDER_OF_GROUP = gql`
  mutation ($orderId: ID, $orderGroupId: ID) {
    cancelOrderOfGroup(input: { orderId: $orderId, orderGroupId: $orderGroupId }) {
      ... on Order {
        id
        code
        state
        active
      }
      ... on CancelOrderOfGroupError {
        errorCode
        parentErrorCode
        message
      }
    }
  }
`;
