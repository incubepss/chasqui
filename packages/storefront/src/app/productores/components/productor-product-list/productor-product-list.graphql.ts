import { gql } from 'apollo-angular';

export const SEARCH_PRODUCTS_PRODUCTOR = gql`
  query SearchProductsProductor($id: ID!, $optionsProducts: ProductListOptions) {
    productor(id: $id) {
      id
      products(options: $optionsProducts) {
        items {
          id
          slug
          name
          description
          facetValues {
            id
          }
          variants {
            id
            name
            priceWithTax
            stockLevel
          }
          assets {
            id
            preview
            focalPoint {
              x
              y
            }
          }
        }
        totalItems
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
