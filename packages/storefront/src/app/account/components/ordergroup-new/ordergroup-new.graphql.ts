import { gql } from 'apollo-angular';

import {
  CART_FRAGMENT,
  ERROR_RESULT_FRAGMENT,
  ORDER_ADDRESS_FRAGMENT,
  ADDRESS_FRAGMENT,
} from '../../../common/graphql/fragments.graphql';

export const ASSIGN_ORDER_TO_GROUP = gql`
  mutation AssignOrderToGroup($orderGroupCode: String) {
    assignActiveOrderToGroup(orderGroupCode: $orderGroupCode) {
      ...Cart
    }
  }
  ${CART_FRAGMENT}
`;

export const CREATE_ORDER_GROUP = gql`
  mutation CreateOrderGroup($shippingMethodId: ID!, $address: CreateAddressInput) {
    createOrderGroup(shippingMethodId: $shippingMethodId, address: $address) {
      ... on OrderGroup {
        id
        code
        alias
        state
        active
      }
      ... on DisabledOrderGroupsError {
        errorCode
        message
      }
    }
  }
`;

export const CANCEL_ORDER_GROUP = gql`
  mutation CancelOrderGroup($orderGroupId: ID!) {
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

export const GET_SHIPPING_ADDRESS = gql`
  query GetShippingAddress {
    activeOrder {
      id
      shippingAddress {
        ...OrderAddress
      }
    }
  }
  ${ORDER_ADDRESS_FRAGMENT}
`;

export const SET_SHIPPING_ADDRESS = gql`
  mutation SetShippingAddress($input: CreateAddressInput!) {
    setOrderShippingAddress(input: $input) {
      ...Cart
      ... on Order {
        shippingAddress {
          ...OrderAddress
        }
      }
      ...ErrorResult
    }
  }
  ${CART_FRAGMENT}
  ${ORDER_ADDRESS_FRAGMENT}
  ${ERROR_RESULT_FRAGMENT}
`;

export const GET_SHIPPING_METHODS = gql`
  query GetShippingMethods {
    shippingMethods {
      id
      name
      description
      price
      priceWithTax
      metadata
      customFields {
        typeDelivery
        schedule
        address_or_places
      }
    }
  }
`;

export const SET_SHIPPING_METHOD = gql`
  mutation SetShippingMethod($id: ID!) {
    setOrderShippingMethod(shippingMethodId: $id) {
      ...Cart
      ...ErrorResult
    }
  }
  ${CART_FRAGMENT}
  ${ERROR_RESULT_FRAGMENT}
`;

export const SET_CUSTOMER_FOR_ORDER = gql`
  mutation SetCustomerForOrder($input: CreateCustomerInput!) {
    setCustomerForOrder(input: $input) {
      ... on Order {
        id
        customer {
          id
          emailAddress
          firstName
          lastName
          phoneNumber
        }
      }
      ...ErrorResult
    }
  }
  ${ERROR_RESULT_FRAGMENT}
`;

export const TRANSITION_TO_ARRANGING_PAYMENT = gql`
  mutation TransitionToArrangingPayment {
    transitionOrderToState(state: "ArrangingPayment") {
      ...Cart
      ...ErrorResult
      ... on OrderStateTransitionError {
        transitionError
      }
    }
  }
  ${CART_FRAGMENT}
  ${ERROR_RESULT_FRAGMENT}
`;

export const CHECK_CUSTOMER_ORDER = gql`
  mutation CheckCustomerOrderActive {
    checkCustomerOrderActive {
      ...Cart
    }
  }
  ${CART_FRAGMENT}
`;

export const CREATE_ADDRESS = gql`
  mutation CreateAddress($input: CreateAddressInput!) {
    createCustomerAddress(input: $input) {
      ...Address
    }
  }
  ${ADDRESS_FRAGMENT}
`;
