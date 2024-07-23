import { gql } from 'apollo-angular';

export const GET_CHANNELS = gql`
  query GetChannels {
    channels {
      id
      token
      code
      customFields {
        nombre
        description
        zoneStore
        provinceStore
        storeEnabled
        showOnMultitienda
        imgPortada {
          id
          name
          type
          preview
          source
          focalPoint {
            x
            y
          }
        }
        messageStoreDisabled
      }
    }
  }
`;
