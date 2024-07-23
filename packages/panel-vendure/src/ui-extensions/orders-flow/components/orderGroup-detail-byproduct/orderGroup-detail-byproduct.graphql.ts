import { gql } from 'apollo-angular';

export const GET_ORDER_GROUP_LINES = gql`
  query GetOrderGroupByCode($code: String!) {
    orderGroupByCode(code: $code) {
      totalQuantity
      currencyCode
      linesGrouped {
        productorId
        productorNombre
        productoNombre
        productoSku
        cantidad
        listPrice
        subTotallistPrice
      }
    }
  }
`;
