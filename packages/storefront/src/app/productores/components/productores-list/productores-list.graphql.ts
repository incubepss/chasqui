import { gql } from 'apollo-angular';

import { ASSET_FRAGMENT } from '../../../common/graphql/fragments.graphql';

export const SEARCH_PRODUCTORES = gql`
  query SearchProductores($options: ProductorListOptions) {
    productores(options: $options) {
      items {
        id
        name
        descriptionOffered
        sellos
        provincia
        localidad
        logo {
          ...Asset
        }
      }
      totalItems
    }
  }
  ${ASSET_FRAGMENT}
`;
