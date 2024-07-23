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

export const GET_ORDER_GROUP = gql`
  query GerOrderGroup($code: String!) {
    orderGroupByCode(code: $code) {
      createdAt
      updatedAt
      active
      state
      code
      totalWithTax
      ordersQuantity
      orders {
        items {
          code
          state
          orderPlacedAt
          totalWithTax

          customer {
            firstName
            lastName
          }
          customFields {
            alias
          }
          lines {
            quantity
            productVariant {
              name
            }
          }
        }
      }
    }
  }
`;

export const CONFIRM_ORDER_GROUP = gql`
  mutation ($code: String) {
    confirmOrderGroup(code: $code) {
      id
      code
      alias
      state
      active
      orderPlacedAt
      createdAt
      updatedAt
    }
  }
`;

export const CANCEL_ORDER_GROUP = gql`
  mutation ($id: ID) {
    cancelOrderGroup(orderGroupId: $id) {
      ... on OrderGroup {
        id
        code
        alias
        state
        active
      }
      ... on CancelOrderGroupsError {
        errorCode
        message
      }
    }
  }
`;
