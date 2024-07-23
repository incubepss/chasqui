import { gql } from 'apollo-angular';

export const SEARCH_PRODUCTS = gql`
  query SearchProducts($input: SearchInput!) {
    search(input: $input) {
      items {
        productVariantId
        productId
        slug
        productName
        description
        facetValueIds
        inStock
        channelIds
        priceWithTax {
          ... on PriceRange {
            min
            max
          }
        }
        productAsset {
          id
          preview
          focalPoint {
            x
            y
          }
        }
      }
      totalItems
      facetValues {
        count
        facetValue {
          id
          name
          code
          facet {
            id
            name
            code
          }
        }
      }
    }
  }
`;

export const GET_FACET_VALUES = gql`
  query GetFacetValues {
    search(input: {}) {
      facetValues {
        facetValue {
          id
          code
          facet {
            id
            name
            code
          }
        }
      }
    }
  }
`;
