import gql from 'graphql-tag';

export const FIND_PRODUCTORES = gql`
  query findProductores($options: ProductorListOptions) {
    productores(options: $options) {
      items {
        id
        name
      }
      totalItems
    }
  }
`;
