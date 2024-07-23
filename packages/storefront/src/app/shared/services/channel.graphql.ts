import { gql } from 'apollo-angular';

export const GET_ACTIVE_CHANNEL = gql`
  query GetActiveChannel {
    activeChannel {
      id
      code
      currencyCode
      defaultLanguageCode
      customFields {
        nombre
        storeEnabled
        messageStoreDisabled
        orderGroupEnabled
        orderSinglesEnabled
        messageOrderSinglesDisabled
        bgColorStore
        bodyAboutUs
        bannersAboutUs {
          preview
          focalPoint {
            x
            y
          }
        }
        imgLogo {
          preview
          focalPoint {
            x
            y
          }
        }
        imgPortada {
          preview
          focalPoint {
            x
            y
          }
        }
        imgSecondaryAboutUs {
          preview
          focalPoint {
            x
            y
          }
        }
        emailStore
        scheduleStore
        whatsappStore
        telegramStore
        rrssStore
      }
    }
  }
`;

export const GET_ACTIVE_CHANNEL_ABOUT_US = gql`
  query GetActiveChannelAboutUs {
    activeChannel {
      id
      code
      currencyCode
      defaultLanguageCode
      customFields {
        bodyAboutUs
        bannersAboutUs {
          preview
          focalPoint {
            x
            y
          }
        }
        imgSecondaryAboutUs {
          preview
          focalPoint {
            x
            y
          }
        }
      }
    }
  }
`;
