import { gql } from 'apollo-angular';

import {
  DISCOUNT_FRAGMENT,
  ORDER_LINE_FRAGMENT,
  FULFILLMENT_FRAGMENT,
  ERROR_RESULT_FRAGMENT,
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
    customFields: {
      codeCustomer: string;
    };
  };
  shippingAddress: {
    streetLine1: string;
    postalCode: string;
    phoneNumber: string;
    city: string;
  };
  shippingLines: Array<ShippingLine>;
};

export const CREATE_FULFILLMENT_GROUP = gql`
  mutation CreateFulfillmentGroup($orderGroupId: ID!, $input: FulfillOrderInput!) {
    addFulfillmentToOrderGroup(orderGroupId: $orderGroupId, input: $input) {
      ...Fulfillment
      ... on CreateFulfillmentError {
        errorCode
        message
        fulfillmentHandlerError
      }
      ... on FulfillmentStateTransitionError {
        errorCode
        message
        transitionError
      }
      ...ErrorResult
    }
  }
  ${FULFILLMENT_FRAGMENT}
  ${ERROR_RESULT_FRAGMENT}
`;

export const TRANSITON_ORDERGROUP_TO_SHIPPED = gql`
  mutation transitionToShipped($orderGroupId: ID!) {
    transitionToShipped(orderGroupId: $orderGroupId) {
      id
      state
      code
      alias
      active
      orderPlacedAt
      updatedAt
      fulfillments {
        id
        state
        method
        nextStates
      }
    }
  }
`;

export const TRANSITON_ORDERGROUP_TO_DELIVERED = gql`
  mutation transitionToDelivered($orderGroupId: ID!) {
    transitionToDelivered(orderGroupId: $orderGroupId) {
      id
      state
      code
      alias
      active
      orderPlacedAt
      updatedAt
      fulfillments {
        id
        state
        method
        nextStates
      }
    }
  }
`;

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
      customFields {
        codeCustomer
      }
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

export const CANCEL_ORDER_GROUP = gql`
  mutation ($orderGroupId: ID) {
    cancelOrderGroup(orderGroupId: $orderGroupId) {
      ... on OrderGroup {
        id
        code
        alias
        state
        active
      }
      ... on CancelOrderGroupsError {
        errorCode
        message
      }
    }
  }
`;
