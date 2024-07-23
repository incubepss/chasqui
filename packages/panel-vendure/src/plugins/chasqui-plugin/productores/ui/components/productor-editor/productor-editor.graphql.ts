import gql from 'graphql-tag';

import { PRODUCTOR_FRAGMENT } from '../../common/fragments.graphql';

export const UPDATE_PRODUCTOR = gql`
  mutation UpdateProductor($input: ProductorUpdateInput!) {
    updateProductor(input: $input) {
      ...Productores
    }
  }
  ${PRODUCTOR_FRAGMENT}
`;

export const CREATE_PRODUCTOR = gql`
  mutation CreateProductor($input: ProductorAddInput!) {
    addProductor(input: $input) {
      ...Productores
    }
  }
  ${PRODUCTOR_FRAGMENT}
`;
