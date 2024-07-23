import gql from 'graphql-tag';

export const shopApiExtensions = gql`
  extend type Query {
    shippingMethods(options: ShippingMethodListOptions): ShippingMethodList!
  }

  input ShippingMethodListOptions
`;
