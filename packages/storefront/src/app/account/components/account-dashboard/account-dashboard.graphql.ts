import { gql } from 'apollo-angular';

export const GET_ACCOUNT_OVERVIEW = gql`
  query GetAccountOverview($optionsOrder: OrderListOptions, $optionsOrderGroup: OrderGroupListOptions) {
    activeCustomer {
      id
      title
      firstName
      lastName
      emailAddress
      orders(options: $optionsOrder) {
        items {
          code
          createdAt
          updatedAt
          state
          totalWithTax
          customFields {
            orderGroup {
              code
              state
            }
          }
        }
      }
      ordersGroup(options: $optionsOrderGroup) {
        items {
          code
          createdAt
          updatedAt
          state
          totalWithTax
          ordersQuantity
        }
      }
    }
  }
`;
