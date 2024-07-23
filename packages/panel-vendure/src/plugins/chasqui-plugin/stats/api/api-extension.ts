import gql from 'graphql-tag';

export const adminApiExtensions = gql`
  type VariantsSold {
    id: String
    name: String
    sku: String
    count: Int
    amount: Int
  }

  input VariantsSoldFilter {
    orderPlacedAt: DateOperators
  }

  input VariantsSoldOptions {
    filter: VariantsSoldFilter
  }

  type CustomSurchargesSold {
    name: String
    sku: String
    count: Int
    amount: Int
  }

  input CustomSurchargesSoldFilter {
    orderPlacedAt: DateOperators
  }

  input CustomSurchargesSoldOptions {
    filter: VariantsSoldFilter
  }

  type OrdersSold {
    quantity: Int
    totalWithTax: Int
  }

  input OrdersSoldFilter {
    orderPlacedAt: DateOperators
  }

  input OrdersSoldOptions {
    filter: OrdersSoldFilter
  }

  extend type Query {
    variantsSold(options: VariantsSoldOptions): [VariantsSold]
    customSurchargesSold(options: OrdersSoldOptions): [CustomSurchargesSold]
    ordersSold(options: OrdersSoldOptions): OrdersSold
  }
`;
