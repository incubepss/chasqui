import { gql } from 'apollo-angular';

export const FIND_ORDERS_BY_PRODUCT = gql`
  query FindOrdersByProduct($input: InputOrderByProduct) {
    ordersByProduct(input: $input) {
      productorId
      productorNombre
      productoNombre
      productoSku
      cantidad
      stockOnHand
      stockAllocated
      listPrice
      subTotallistPrice
    }
  }
`;
