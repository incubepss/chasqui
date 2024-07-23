import gql from 'graphql-tag';

export const ordersByProductTypesGQL = gql`
  type OrderItemGrouped {
    productorId: String
    productorNombre: String
    productoNombre: String!
    productoSku: String!
    shippingMethodCode: String
    cantidad: Int
    stockOnHand: Int
    stockAllocated: Int
    listPrice: Float
    subTotallistPrice: Float
  }

  enum VirutalOrderState {
    NUEVOS
    EN_PREPARACION
    EN_ENTREGA
  }

  input InputOrderByProduct {
    orderState: VirutalOrderState
    shippingMethodId: ID
  }
`;

export const adminApiExtensions = gql`
  ${ordersByProductTypesGQL}

  extend type Query {
    ordersByProduct(input: InputOrderByProduct): [OrderItemGrouped]
  }
`;
