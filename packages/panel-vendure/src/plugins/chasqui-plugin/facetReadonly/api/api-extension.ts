import gql from 'graphql-tag';

export const shopApiExtensions = gql`
  extend type Query {
    sellos: [FacetValue]
  }
`;
