import { gql } from 'apollo-angular';

export const GET_ELIGIBLE_SHIPPING_METHODS = gql`
  query GetEligibleShippingMethods {
    eligibleShippingMethods {
      id
      name
      description
      price
      priceWithTax
      metadata
      customFields {
        typeDelivery
        address_or_places
        schedule
        geolocation
      }
    }
  }
`;

export const GET_SHIPPING_METHODS = gql`
  query GetShippingMethods {
    shippingMethods {
      totalItems
      items {
        id
        name
        description
        customFields {
          typeDelivery
          address_or_places
          schedule
          geolocation
        }
      }
    }
  }
`;
