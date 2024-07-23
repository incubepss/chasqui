import gql from 'graphql-tag';

export const GET_ODOO_PRODUCTS = gql`
  query GetOdooProducts {
    getOdooProducts {
      id
      name
      list_price
      qty_available
      barcode
      product_tooltip
      image_128
      taxes_id
      tax_string
      pos_categ
    }
  }
`;

export const IMPORT_PRODUCTS_TO_CHANNEL = gql`
  mutation ImportProductsOdooToChannel($odooProducts: [odooProductInput!]!) {
    importProductsOdooToChannel(odooProducts: $odooProducts)
  }
`;
