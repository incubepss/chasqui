import { gql } from 'apollo-angular';

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
  payments: Array<any>;
};

export const FIND_ORDERS_TO_EXPORT = gql`
  query FindOrdersToExport($options: OrderListOptions) {
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
        shippingAddress {
          streetLine1
          city
          phoneNumber
          postalCode
        }
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
        surcharges {
          id
          sku
          description
          priceWithTax
        }
      }
    }
  }
`;
