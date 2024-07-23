import { gql } from 'apollo-angular';

import {
  CART_FRAGMENT,
  ERROR_RESULT_FRAGMENT,
  ORDER_ADDRESS_FRAGMENT,
} from '../../common/graphql/fragments.graphql';

export const GET_GROUP_BY_CODE = gql`
  query GetGroupByCode($code: String!) {
    orderGroupByCode(code: $code) {
      id
      alias
      code
      state
      active
      customer {
        firstName
        lastName
        emailAddress
        phoneNumber
      }
      channel {
        id
        code
        token
        customFields {
          nombre
          imgLogo {
            preview
            focalPoint {
              x
              y
            }
          }
        }
      }
    }
  }
`;

export const GET_ACTIVE_GROUPS = gql`
  query GeActiveGroups($options: OrderGroupListOptions) {
    activeCustomer {
      ordersGroup(options: $options) {
        items {
          id
          code
          alias
          active
          state
          totalQuantity
          total
          totalWithTax
          shipping
          shippingWithTax
          subTotal
          subTotalWithTax
          ordersQuantity
          createdAt
        }
        totalItems
      }
    }
  }
`;

export const DEACTIVATE_ORDER_GROUP = gql`
  mutation DeactivateOrderGroupActiveOrder {
    deactivateOrderGroupActiveOrder {
      id
      code
      state
      active
      customFields {
        orderGroup {
          id
          state
        }
      }
    }
  }
`;

export const ASSIGN_ORDER_TO_GROUP = gql`
  mutation AssignOrderToGroup($orderGroupCode: String, $alias: String) {
    assignActiveOrderToGroup(orderGroupCode: $orderGroupCode, alias: $alias) {
      ... on Order {
        ...Cart
        customFields {
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

      ... on DisabledOrderGroupsError {
        errorCode
        message
      }
    }
  }
  ${CART_FRAGMENT}
`;
