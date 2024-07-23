import gql from 'graphql-tag';

import { PRODUCTOR_FRAGMENT } from '../../common/fragments.graphql';

export const FIND_PRODUCTORES = gql`
  query FindProductores($options: ProductorListOptions) {
    productores(options: $options) {
      items {
        ...Productores
      }
      totalItems
    }
  }
  ${PRODUCTOR_FRAGMENT}
`;

export const DELETE_PRODUCTOR = gql`
  mutation DeleteProductor($input: ID!) {
    deleteProductor(id: $input) {
      ... on Productor {
        ...Productores
      }
      ... on ErrorResult {
        errorCode
        message
      }
    }
  }
  ${PRODUCTOR_FRAGMENT}
`;
