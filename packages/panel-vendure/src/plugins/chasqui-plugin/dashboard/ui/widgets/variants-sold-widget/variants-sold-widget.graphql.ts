import gql from 'graphql-tag';

export const GET_VARIANTS_SOLD = gql`
  query GetVariantsSold($options: VariantsSoldOptions) {
    variantsSold(options: $options) {
      name
      sku
      count
      amount
    }
  }
`;
