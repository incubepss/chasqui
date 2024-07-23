import { gql } from 'apollo-angular';

export const GET_ELIGIBLE_PAYMENT_METHODS = gql`
  query GetEligiblePaymentMethods {
    eligiblePaymentMethods {
      id
      code
      name
      description
      eligibilityMessage
      isEligible
      customFields {
        paymentInstruction
      }
    }
  }
`;
