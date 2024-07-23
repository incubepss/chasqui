import { gql } from 'apollo-angular';

export const GET_ORDER_GROUP = gql`
  query GerOrderGroupLines($code: String!) {
    orderGroupByCode(code: $code) {
      id
      createdAt
      updatedAt
      orderPlacedAt
      active
      state
      code
      alias
      totalQuantity
      total
      totalWithTax
      shipping
      shippingWithTax
      subTotal
      subTotalWithTax
      ordersQuantity
      channel {
        customFields {
          nombre
          emailStore
          phoneStore
          whatsappStore
          telegramStore
          imgLogo {
            source
            preview
          }
        }
      }
      shippingLines {
        priceWithTax
      }
      shippingMethod {
        name
        customFields {
          typeDelivery
          address_or_places
        }
      }
      shippingAddress {
        streetLine1
        city
        province
        postalCode
        phoneNumber
      }
      customer {
        firstName
        lastName
        emailAddress
        phoneNumber
      }
      linesGrouped {
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
  }
`;
