import { gql } from 'apollo-angular';

export const ARREPENTIMIENTO_REQUEST = gql`
  mutation ArrepentimientoRequest($input: ArrepentimientoInput!) {
    receiveArrepentimiento(input: $input)
  }
`;
