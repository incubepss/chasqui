import { gql } from 'apollo-angular';
import { CART_FRAGMENT } from './../checkout-mercadopago/checkout-mercadopago.graphql';

export const FIND_SURCHARGES = gql`
  {
    customSurcharges {
      id
      name
      question
      enabled
      options {
        id
        description
        listPrice
        sku
      }
    }
  }
`;

export const USE_SURCHARGE = gql`
  mutation UseSurcharge($input: UseSurchargeOptionInput!) {
    useCustomSurchargeOptionOnOrder(input: $input) {
      ...Cart
    }
  }
  ${CART_FRAGMENT}
`;
