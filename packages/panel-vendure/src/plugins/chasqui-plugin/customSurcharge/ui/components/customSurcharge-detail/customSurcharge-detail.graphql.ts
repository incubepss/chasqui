import gql from 'graphql-tag';

export const CREATE_SURCHARGE = gql`
  mutation Create($input: CustomSurchargeAddInput!) {
    addCustomSurcharge(input: $input) {
      id
      enabled
      name
      question
      options {
        id
        description
        listPrice
      }
    }
  }
`;

export const UPDATE_SURCHARGE = gql`
  mutation Update($input: CustomSurchargeUpdateInput!) {
    updateCustomSurcharge(input: $input) {
      id
      enabled
      name
      question
      options {
        id
        description
        listPrice
      }
    }
  }
`;
