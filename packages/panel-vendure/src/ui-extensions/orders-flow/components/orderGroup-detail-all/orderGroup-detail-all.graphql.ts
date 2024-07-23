import { gql } from 'apollo-angular';

const ORDER_GROUP_FRAGMENT = gql`
  fragment OrderGroup on OrderGroup {
    id
    state
    code
    alias
    active
    orderPlacedAt
    updatedAt
    totalQuantity
    total
    totalWithTax
    shipping
    shippingWithTax
    subTotal
    subTotalWithTax
    ordersQuantity
    currencyCode
    fulfillments {
      id
      state
      method
      nextStates
    }
    shippingAddress {
      streetLine1
      postalCode
      phoneNumber
      city
    }
    shippingMethod {
      code
      name
      description
      customFields {
        typeDelivery
      }
    }
    shippingLines {
      price
      priceWithTax
      discountedPrice
      discountedPriceWithTax
      shippingMethod {
        code
        name
        description
        customFields {
          typeDelivery
        }
      }
    }
    customer {
      firstName
      lastName
      emailAddress
    }
    channel {
      id
      code
      token
    }
  }
`;

export const GET_ALL_ORDERS_ORDERGROUP = gql`
  query GetAllOrdersOrderGroup($code: String!) {
    orderGroupByCode(code: $code) {
      ...OrderGroup
      orders(options: { filter: { state: { notIn: ["Created"] } } }) {
        items {
          id
          code
          orderPlacedAt
          createdAt
          totalQuantity
          totalWithTax
          state
          customer {
            id
            firstName
            lastName
            emailAddress
            phoneNumber
          }
        }
        totalItems
      }
    }
  }
  ${ORDER_GROUP_FRAGMENT}
`;
