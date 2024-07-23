import { gql } from 'apollo-angular';

export const GET_VARIANTS_SOLD = gql`
  query GetVariantsSold($options: VariantsSoldOptions) {
    variantsSold(options: $options) {
      id
    }
  }
`;

export const GET_TOP_SOLD = gql`
  query ProductList($options: ProductListOptions) {
    products(options: $options) {
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
`;

export const GET_ACTIVE_CHANNEL_ABOUT_US = gql`
  query GetActiveChannelAboutUs {
    activeChannel {
      id
      code
      currencyCode
      defaultLanguageCode
      customFields {
        bodyAboutUs
        bannersAboutUs {
          preview
          focalPoint {
            x
            y
          }
        }
        imgSecondaryAboutUs {
          preview
          focalPoint {
            x
            y
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
