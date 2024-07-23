import gql from 'graphql-tag';

export const GET_CUSTOMSURCHARGES_SOLD = gql`
  query GetCustomSurchargesSold($options: OrdersSoldOptions) {
    customSurchargesSold(options: $options) {
      name
      sku
      count
      amount
    }
  }
`;
