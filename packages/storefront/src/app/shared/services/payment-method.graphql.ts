import { gql } from 'apollo-angular';

export const GET_PAYMENT_METHODS = gql`
  query GetPaymentMethods {
    paymentMethods {
      totalItems
      items {
        id
        code
        name
        description
        handler {
          code
        }
        customFields {
          paymentInstruction
        }
      }
    }
  }
`;
