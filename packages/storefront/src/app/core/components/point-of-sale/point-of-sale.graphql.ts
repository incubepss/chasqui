import { gql } from 'apollo-angular';

export const SEARCH_PRODUCTS = gql`
  query SearchProducts($input: SearchInput!) {
    search(input: $input) {
      totalItems
      items {
        productVariantId
        sku
        inStock
        productName
        priceWithTax {
          ... on SinglePrice {
            value
          }
        }
      }
    }
  }
`;
