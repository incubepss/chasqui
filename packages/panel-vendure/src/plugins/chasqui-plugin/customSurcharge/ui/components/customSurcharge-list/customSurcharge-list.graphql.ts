import gql from 'graphql-tag';

export const GET_SURCHARGES = gql`
  query GetRecords {
    customSurcharges {
      id
      name
      question
      enabled
    }
  }
`;

export const DELETE_SURCHARGE = gql`
  mutation DeleteSurcharge($input: ID!) {
    deleteCustomSurcharge(id: $input) {
      ... on CustomSurcharge {
        id
        name
        enabled
      }
    }
  }
`;
