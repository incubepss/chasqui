import { gql } from 'apollo-angular';

import {
  DISCOUNT_FRAGMENT,
  ORDER_LINE_FRAGMENT,
  ORDER_DETAIL_FRAGMENT,
  FULFILLMENT_FRAGMENT,
} from '@vendure/admin-ui/core';

type ShippingLine = {
  priceWithTax: number;
  shippingMethod: {
    name: string;
    customFields: {
      typeDelivery: 'shipping' | 'showroom';
      address_or_places: string;
      location: string;
    };
  };
};

export type OrderListFragment = {
  id: string;
  code: string;
  active: boolean;
  state: string;
  totalQuantity: number;
  subTotal: number;
  subTotalWithTax: number;
  total: number;
  totalWithTax: number;
  updatedAt: Date;
  currencyCode: string;
  customer: {
    id: string;
    firstName: string;
    lastName: string;
    emailAddress: string;
    phoneNumber: string;
  };
  shippingAddress: {
    streetLine1: string;
    postalCode: string;
    phoneNumber: string;
    city: string;
  };
  shippingLines: Array<ShippingLine>;
};

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

export const GET_ORDER_GROUP = gql`
  query GetOrderGroupByCode($code: String!) {
    orderGroupByCode(code: $code) {
      ...OrderGroup
      ordersConfirmed {
        items {
          id
          code
          orderPlacedAt
          totalQuantity
          totalWithTax
          customer {
            id
            firstName
            lastName
            emailAddress
          }
        }
        totalItems
      }
    }
  }
  ${ORDER_GROUP_FRAGMENT}
`;

export const GET_ORDER_GROUP_LINES = gql`
  query GetOrderGroupByCode($code: String!) {
    orderGroupByCode(code: $code) {
      ...OrderGroup
      lines {
        ...OrderLine
      }
    }
  }
  ${ORDER_GROUP_FRAGMENT}
  ${DISCOUNT_FRAGMENT}
  ${FULFILLMENT_FRAGMENT}
  ${ORDER_LINE_FRAGMENT}
`;

export const GET_ORDER_GROUP_EXPANDED = gql`
  query GetOrderGroupByCode($code: String!) {
    orderGroupByCode(code: $code) {
      ...OrderGroup
      ordersConfirmed {
        items {
          ...OrderDetail
          id
          code
          orderPlacedAt
          totalQuantity
          totalWithTax
          customer {
            id
            firstName
            lastName
            emailAddress
          }
          lines {
            ...OrderLine
          }
        }
        totalItems
      }
    }
  }
  ${ORDER_GROUP_FRAGMENT}
  ${ORDER_DETAIL_FRAGMENT}
  ${DISCOUNT_FRAGMENT}
  ${FULFILLMENT_FRAGMENT}
  ${ORDER_LINE_FRAGMENT}
`;
