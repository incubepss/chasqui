import { gql } from 'apollo-angular';

import { CART_FRAGMENT } from '../../../common/graphql/fragments.graphql';

export const GET_ORDER_BY_CODE = gql`
  query GetOrderByCode($code: String!) {
    orderByCode(code: $code) {
      ...Cart
      updatedAt
      customer {
        id
        emailAddress
        firstName
        lastName
        phoneNumber
        user {
          id
          identifier
          verified
        }
      }
      shippingAddress {
        city
        province
        postalCode
        streetLine1
      }
      payments {
        id
        state
        amount
        method
        transactionId
        paymentMethod {
          id
          name
          description
        }
        metadata
      }
      customFields {
        isOrderHeadOfGroup
        orderGroup {
          id
          alias
          code
          customer {
            firstName
            lastName
            emailAddress
            phoneNumber
          }
        }
      }
    }
  }
  ${CART_FRAGMENT}
`;
