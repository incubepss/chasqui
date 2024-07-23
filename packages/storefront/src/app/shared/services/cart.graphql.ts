import { gql } from 'apollo-angular';

import { CART_FRAGMENT } from '../../common/graphql/fragments.graphql';

export const GET_ACTIVE_ORDER = gql`
  query GetActiveOrder {
    activeOrder {
      ...Cart
      customFields {
        isOrderHeadOfGroup
        orderGroup {
          id
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
