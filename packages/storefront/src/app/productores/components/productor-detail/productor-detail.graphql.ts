import { gql } from 'apollo-angular';

import { ASSET_FRAGMENT } from '../../../common/graphql/fragments.graphql';

export const SEARCH_PRODUCTOR = gql`
  query SearchProductor($id: ID!) {
    productor(id: $id) {
      id
      name
      slug
      descriptionOffered
      description
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
  }
  ${ASSET_FRAGMENT}
`;
