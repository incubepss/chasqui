import gql from 'graphql-tag';

export const adminApiExtensions = gql`
  extend input OrderFilterParameter {
    shippingMethodId: ID
    key: String
    # paymentMethodCode: String # en construcción
    # paymentDone: Boolean # en construcción
  }

  type StatOrdersByState {
    state: String
    count: Int
    subTotalWithTax: Float
    subTotalshippingWithTax: Float
  }

  input InputCountOrdersByState {
    shippingMethodId: ID
    code: String
    key: String
    orderPlacedAt: DateOperators
  }

  extend type Query {
    countOrdersByState(options: InputCountOrdersByState): [StatOrdersByState]
  }
`;
