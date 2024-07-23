import { gql } from 'apollo-angular';

export const GET_ORDER_LIST = gql`
  query GetOrderList($options: OrderListOptions) {
    activeCustomer {
      id
      orders(options: $options) {
        items {
          id
          orderPlacedAt
          code
          state
          currencyCode
          totalQuantity
          total
          totalWithTax
          customFields {
            orderGroup {
              code
              state
            }
          }
        }
        totalItems
      }
    }
  }
`;
