import { gql } from 'apollo-angular';

import { ERROR_RESULT_FRAGMENT } from '../../../common/graphql/fragments.graphql';

export const CART_FRAGMENT = gql`
  fragment Cart on Order {
    id
    code
    state
    active
    lines {
      id
      unitPrice
      unitPriceWithTax
      quantity
      linePriceWithTax
      discountedLinePriceWithTax
      productVariant {
        id
        name
      }
      discounts {
        amount
        amountWithTax
        description
        adjustmentSource
        type
      }
    }
    totalQuantity
    subTotal
    subTotalWithTax
    total
    totalWithTax
    shipping
    shippingWithTax
    shippingLines {
      priceWithTax
      shippingMethod {
        id
        code
        name
        description
      }
    }
    discounts {
      amount
      amountWithTax
      description
      adjustmentSource
      type
    }
    payments {
      id
      state
      amount
      metadata
    }
  }
`;

export const GET_ELIGIBLE_PAYMENT_METHODS = gql`
  query GetEligiblePaymentMethods {
    eligiblePaymentMethods {
      id
      code
      name
      description
      eligibilityMessage
      isEligible
    }
  }
`;

export const ADD_PAYMENT = gql`
  mutation AddPayment($input: PaymentInput!) {
    addPaymentToOrder(input: $input) {
      ...Cart
      ...ErrorResult
    }
  }
  ${CART_FRAGMENT}
  ${ERROR_RESULT_FRAGMENT}
`;

export const GET_ORDER_BY_CODE = gql`
  query GetOrderByCode($code: String!) {
    orderByCode(code: $code) {
      ...Cart
      updatedAt
      customer {
        id
        emailAddress
        firstName
        lastName
        phoneNumber
        user {
          id
          identifier
          verified
        }
      }
      shippingAddress {
        city
        province
        postalCode
        streetLine1
      }
      payments {
        id
        state
        amount
        method
        transactionId
        paymentMethod {
          id
          name
          description
        }
        metadata
      }
    }
  }
  ${CART_FRAGMENT}
`;
