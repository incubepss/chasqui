import gql from 'graphql-tag';

export const ADD_NOTE = gql`
  mutation AddNoteToOrder($AddNoteToOrderInput: AddNoteToOrderInput!) {
    addNoteToOrder(input: $AddNoteToOrderInput) {
      id
      history {
        items {
          id
          data
        }
      }
    }
  }
`;

export const EXPORT_ORDER = gql`
  mutation ExportOrderToOdoo($orderId: ID!) {
    exportOrderToOdoo(orderId: $orderId)
  }
`;

export const FIND_CUSTOMER = gql`
  query findCustomer($email: String!) {
    findOdooCustomer(email: $email) {
      id
      name
      display_name
      email
    }
  }
`;

export const GET_ORDERS = gql`
  query GetOrders($options: OrderListOptions) {
    orders(options: $options) {
      items {
        id
        code
        state
        totalWithTax
        customer {
          emailAddress
          firstName
          lastName
        }
        history {
          items {
            createdAt
            updatedAt
            data
          }
        }
      }
      totalItems
    }
  }
`;
