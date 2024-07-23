import { gql } from 'apollo-angular';

import { CART_FRAGMENT, ORDER_ADDRESS_FRAGMENT } from '../../common/graphql/fragments.graphql';

export const GET_ORDER_FOR_CHECKOUT = gql`
  query GetOrderForCheckout {
    activeOrder {
      ...Cart
      shippingAddress {
        ...OrderAddress
      }
      shippingLines {
        id
        shippingMethod {
          customFields {
            typeDelivery
            address_or_places
            schedule
          }
        }
      }
      customFields {
        isOrderHeadOfGroup
        orderGroup {
          id
          code
          alias
          customer {
            firstName
            lastName
            emailAddress
            phoneNumber
          }
          shippingLine {
            id
          }
        }
      }
    }
  }
  ${CART_FRAGMENT}
  ${ORDER_ADDRESS_FRAGMENT}
`;
