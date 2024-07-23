import { gql } from 'apollo-angular';

export const FIND_SURCHARGES = gql`
  {
    customSurcharges {
      id
      name
      question
      enabled
      options {
        id
        description
        listPrice
        sku
      }
    }
  }
`;
