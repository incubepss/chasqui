import gql from 'graphql-tag';

export const adminApiExtensions = gql`
  type odooProduct {
    id: Int
    name: String!
    list_price: String
    qty_available: Int
    barcode: String!
    image_128: String
    product_tooltip: String
    taxes_id: [Int]
    tax_string: String
    pos_categ: String
  }

  input odooProductInput {
    id: Int
    name: String!
    list_price: String
    qty_available: Int
    barcode: String!
    image_128: String
    product_tooltip: String
    taxes_id: [Int]
    tax_string: String
    pos_categ: String
  }

  extend type Query {
    getOdooProducts: [odooProduct]
  }

  extend type Mutation {
    importProductsOdooToChannel(odooProducts: [odooProductInput!]!): String
    exportOrderToOdoo(orderId: ID!): ID
  }
`;
