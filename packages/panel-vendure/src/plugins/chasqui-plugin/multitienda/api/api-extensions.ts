import gql from 'graphql-tag';

export const adminApiExtensions = gql`
  input CreateTiendaInput {
    code: String
    token: String
    city: String
    province: String
    emailAdmin: String
    nameAdmin: String
    lastNameAdmin: String
    password: String
  }

  type CreateTiendaError implements ErrorResult {
    errorCode: ErrorCode!
    message: String!
    friendlyMessage: String
  }

  extend enum ErrorCode {
    PRUEBA_CODIGO
    TIENDA_DUPLICADA
  }

  union CreateTiendaResult = Channel | LanguageNotAvailableError | CreateTiendaError

  extend type Mutation {
    createTienda(input: CreateTiendaInput!): CreateTiendaResult
  }
`;

export const shopApiExtensions = gql`
  extend type Query {
    channels: [Channel!]!
  }
  extend type SearchResult {
    channelIds: [ID!]!
  }
`;
