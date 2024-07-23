import gql from 'graphql-tag';

export const commonApiExtensions = gql`
  type Productor implements Node {
    enabled: Boolean
    name: String!
    slug: String!
    description: String
    descriptionOffered: String
    createdAt: DateTime!
    updatedAt: DateTime!
    id: ID!
    products: ProductList
    sellos: [String]
    logo: Asset
    banner: Asset
    pais: String
    provincia: String
    localidad: String
    direccion: String
    webUrl: String
    email: String
    linksRRSS: [String]
  }

  type ProductorList implements PaginatedList {
    items: [Productor!]!
    totalItems: Int!
  }

  extend type Query {
    productores(options: ProductorListOptions): ProductorList!
    productor(id: ID!): Productor
  }

  # Auto-generated at runtime by generateListOptions vendure core method
  input ProductorListOptions {
    filterSellos: [String]
  }
`;

export const adminApiExtensions = gql`
  ${commonApiExtensions}

  input ProductorAddInput {
    enabled: Boolean
    name: String!
    slug: String!
    description: String
    descriptionOffered: String
    sellos: [String]
    logoId: ID
    bannerId: ID
    pais: String
    provincia: String
    localidad: String
    direccion: String
    webUrl: String
    email: String
    linksRRSS: [String]
  }

  input ProductorUpdateInput {
    enabled: Boolean
    id: ID!
    name: String!
    slug: String!
    description: String
    descriptionOffered: String
    sellos: [String]
    logoId: ID
    bannerId: ID
    pais: String
    provincia: String
    localidad: String
    direccion: String
    webUrl: String
    email: String
    linksRRSS: [String]
  }

  type ProductorUsedError implements ErrorResult {
    errorCode: ErrorCode!
    message: String!
  }

  union DeleteProductorResult = Productor | ProductorUsedError

  extend type Mutation {
    addProductor(input: ProductorAddInput!): Productor
    updateProductor(input: ProductorUpdateInput!): Productor!
    deleteProductor(id: ID!): DeleteProductorResult!

    assignProductor(idProducto: ID!, idProductor: ID!): String
  }
`;

export const shopApiExtensions = gql`
  ${commonApiExtensions}

  extend type Product {
    productor(id: ID!): Productor
    channels: [Channel]
  }
`;
