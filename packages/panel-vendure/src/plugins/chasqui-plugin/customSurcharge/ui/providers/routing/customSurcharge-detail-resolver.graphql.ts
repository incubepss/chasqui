import gql from 'graphql-tag';

export const GET_CUSTOMSURCHARGE = gql`
  query GetExample($id: ID!) {
    customSurcharge(id: $id) {
      id
      name
      question
      enabled
      options {
        id
        listPrice
        description
      }
    }
  }
`;
