import gql from 'graphql-tag';

export const shopApiExtensions = gql`
  input ArrepentimientoInput {
    name: String
    email: String
    phone: String
    description: String
  }

  extend type Mutation {
    receiveArrepentimiento(input: ArrepentimientoInput!): String
  }
`;
