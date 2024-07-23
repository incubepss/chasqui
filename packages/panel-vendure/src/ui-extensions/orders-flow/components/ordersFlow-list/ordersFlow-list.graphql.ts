import { gql } from 'apollo-angular';

import {
  ORDER_DETAIL_FRAGMENT,
  ORDER_LINE_FRAGMENT,
  FULFILLMENT_FRAGMENT,
  DISCOUNT_FRAGMENT,
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

export const FIND_ORDERS_GROUP = gql`
  query FindOrdersGroup($options: OrderGroupListOptions) {
    ordersGroup(options: $options) {
      items {
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
        customer {
          firstName
          lastName
          emailAddress
        }
      }
      totalItems
    }
  }
`;

export const FIND_ORDERS = gql`
  query FindOrders($options: OrderListOptions) {
    orders(options: $options) {
      items {
        id
        code
        active
        state
        totalQuantity
        subTotal
        subTotalWithTax
        total
        totalWithTax
        updatedAt
        currencyCode
        customer {
          id
          firstName
          lastName
          emailAddress
          phoneNumber
        }
        customFields {
          orderGroup {
            id
            code
            alias
            state
          }
        }
      }
    }
  }
`;

export const COUNT_ORDERS_BY_STATE = gql`
  query CountOrdersByState($options: InputCountOrdersByState) {
    countOrdersByState(options: $options) {
      state
      count
      subTotalWithTax
      subTotalshippingWithTax
    }
  }
`;

export const COUNT_ORDERSGROUP_BY_STATE = gql`
  query CountOrdersGroupByState($options: InputCountOrdersGroupByState) {
    countOrdersGroupByState(options: $options) {
      state
      count
      subTotalWithTax
      subTotalshippingWithTax
    }
  }
`;

export const GET_ORDER = gql`
  query GetOrder($id: ID!) {
    order(id: $id) {
      ...OrderDetail
      totalQuantity
      orderPlacedAt
      shippingLines {
        shippingMethod {
          id
          name
          customFields {
            typeDelivery
            address_or_places
          }
        }
        priceWithTax
      }
      customer {
        id
        firstName
        lastName
        emailAddress
        phoneNumber
        customFields {
          codeCustomer
        }
      }
      payments {
        id
        createdAt
        updatedAt
        transactionId
        amount
        method
        state
        errorMessage
        metadata
      }
    }
  }
  ${ORDER_DETAIL_FRAGMENT}
`;
