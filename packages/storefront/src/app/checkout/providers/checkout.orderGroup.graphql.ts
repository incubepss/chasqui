import { gql } from 'apollo-angular';

export const CREATE_ORDER_GROUP = gql`
  mutation CreateOrderGroupActiveOrder {
    createOrderGroupActiveOrder {
      ... on OrderGroup {
        id
        code
        alias
        state
        active
      }
      ... on DisabledOrderGroupsError {
        errorCode
        message
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
