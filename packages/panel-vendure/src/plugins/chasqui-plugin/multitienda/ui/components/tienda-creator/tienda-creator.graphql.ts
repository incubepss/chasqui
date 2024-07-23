import gql from 'graphql-tag';

export const ERROR_RESULT_FRAGMENT = gql`
  fragment ErrorResult on ErrorResult {
    errorCode
    message
  }

  fragment CreateTiendaError on CreateTiendaError {
    errorCode
    message
    friendlyMessage
  }
`;

export const CHANNEL_FRAGMENT = gql`
  fragment Channel on Channel {
    id
    createdAt
    updatedAt
    code
    token
    pricesIncludeTax
    currencyCode
    defaultLanguageCode
    defaultShippingZone {
      id
      name
    }
    defaultTaxZone {
      id
      name
    }
  }
`;

export const CREATE_TIENDA = gql`
  mutation CreateTienda($input: CreateTiendaInput!) {
    createTienda(input: $input) {
      ...Channel
      ...ErrorResult
      ...CreateTiendaError
    }
  }
  ${CHANNEL_FRAGMENT}
  ${ERROR_RESULT_FRAGMENT}
`;
