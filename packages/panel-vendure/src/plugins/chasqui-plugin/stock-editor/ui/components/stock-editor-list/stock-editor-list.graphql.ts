import { gql } from 'apollo-angular';

export const GET_PRODUC_VARIANTS = gql`
  query GetProductVariantList($options: ProductVariantListOptions!, $productId: ID) {
    productVariants(options: $options, productId: $productId) {
      items {
        ...ProductVariant
        __typename
      }
      totalItems
      __typename
    }
  }

  fragment ProductVariant on ProductVariant {
    id
    createdAt
    updatedAt
    enabled
    languageCode
    name
    price
    priceWithTax
    currencyCode
    stockOnHand
    stockAllocated
    stockLevel
    trackInventory
    outOfStockThreshold
    useGlobalOutOfStockThreshold
    sku
    product {
      id
      enabled
      customFields {
        productor {
          name
        }
      }
    }
    __typename
  }
`;

export const EXPORT_PRODUCT_VARIANTS = gql`
  query GetProductVariantList($options: ProductVariantListOptions!, $productId: ID) {
    productVariants(options: $options, productId: $productId) {
      items {
        updatedAt
        enabled
        name
        priceWithTax
        stockOnHand
        stockAllocated
        sku
        product {
          enabled
          customFields {
            productor {
              name
            }
          }
        }
      }
    }
  }
`;
