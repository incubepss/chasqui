import gql from 'graphql-tag';

export const ASSET_FRAGMENT = gql`
  fragment Asset on Asset {
    id
    createdAt
    updatedAt
    name
    fileSize
    mimeType
    type
    preview
    source
    width
    height
    focalPoint {
      x
      y
    }
  }
`;

export const PRODUCTOR_FRAGMENT = gql`
  fragment Productores on Productor {
    id
    enabled
    name
    slug
    description
    descriptionOffered
    sellos
    logo {
      ...Asset
    }
    banner {
      ...Asset
    }
    pais
    provincia
    localidad
    direccion
    webUrl
    email
    linksRRSS
  }
  ${ASSET_FRAGMENT}
`;
