import gql from 'graphql-tag';

export const shopApiExtensions = gql`
  extend type Payment {
    paymentMethod: PaymentMethodQuote
  }

  extend type Query {
    paymentMethods(options: PaymentMethodListOptions): PaymentMethodList!
  }

  type PaymentMethodList implements PaginatedList {
    items: [PaymentMethod!]!
    totalItems: Int!
  }

  input PaymentMethodListOptions
`;
