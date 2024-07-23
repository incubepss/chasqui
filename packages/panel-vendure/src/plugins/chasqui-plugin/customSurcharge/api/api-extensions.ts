import gql from 'graphql-tag';

export const commonApiExtensions = gql`
  type CustomSurchargeOption implements Node {
    id: ID!
    listPrice: Int
    sku: String
    description: String
  }

  type CustomSurcharge implements Node {
    id: ID!
    name: String!
    question: String
    options: [CustomSurchargeOption]
    enabled: Boolean
  }

  extend type Query {
    customSurcharges: [CustomSurcharge]
    customSurcharge(id: ID!): CustomSurcharge
  }
`;

export const adminApiExtensions = gql`
  ${commonApiExtensions}

  input CustomSurchargeOptionAddInput {
    listPrice: Int
    sku: String
    description: String
  }

  input CustomSurchargeAddInput {
    enabled: Boolean
    name: String!
    question: String
    options: [CustomSurchargeOptionAddInput]
  }

  input CustomSurchargeOptionUpdateInput {
    id: ID
    listPrice: Int
    sku: String
    description: String
    flagRemove: Boolean
  }

  input CustomSurchargeUpdateInput {
    id: ID!
    enabled: Boolean
    name: String!
    question: String
    options: [CustomSurchargeOptionUpdateInput]
  }

  type CustomSurchargeUsedError implements ErrorResult {
    errorCode: ErrorCode!
    message: String!
  }

  union DeleteCustomSurchargeResult = CustomSurcharge | CustomSurchargeUsedError

  extend type Mutation {
    addCustomSurcharge(input: CustomSurchargeAddInput!): CustomSurcharge
    updateCustomSurcharge(input: CustomSurchargeUpdateInput!): CustomSurcharge!
    deleteCustomSurcharge(id: ID!): DeleteCustomSurchargeResult!
  }
`;

export const shopApiExtensions = gql`
  ${commonApiExtensions}

  input SurchargeInput {
    description: String
    sku: String
    price: Int
    priceIncludesTax: Boolean
    taxRate: Float
    taxDescription: String
  }

  input UseSurchargeOptionInput {
    id: ID!
  }

  extend type Mutation {
    useCustomSurchargeOptionOnOrder(input: UseSurchargeOptionInput!): Order
  }
`;
