import gql from 'graphql-tag';

export const adminApiExtensions = gql`
  input ProductVariantFilterParameter {
    key: String
  }
`;
