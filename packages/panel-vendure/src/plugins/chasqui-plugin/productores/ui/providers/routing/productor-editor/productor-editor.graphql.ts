import gql from 'graphql-tag';
import { PRODUCTOR_FRAGMENT } from '../../../common/fragments.graphql';

export const GET_PRODUCTOR = gql`
  query GetProductor($id: ID!) {
    productor(id: $id) {
      ...Productores
    }
  }
  ${PRODUCTOR_FRAGMENT}
`;
