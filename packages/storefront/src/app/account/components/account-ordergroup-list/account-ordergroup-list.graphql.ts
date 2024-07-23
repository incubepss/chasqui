import { gql } from 'apollo-angular';

export const GET_ORDERS_GROUP_LIST = gql`
  query GetOrdersGroupList($options: OrderGroupListOptions) {
    activeCustomer {
      id
      ordersGroup(options: $options) {
        items {
          id
          createdAt
          updatedAt
          code
          state
          totalQuantity
          total
          totalWithTax
          ordersQuantity
        }
        totalItems
      }
    }
  }
`;
