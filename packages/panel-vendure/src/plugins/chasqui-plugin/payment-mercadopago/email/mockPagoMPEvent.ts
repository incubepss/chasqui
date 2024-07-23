import { RequestContext } from '@vendure/core';
import { PagoRecibidoMercadoPagoEvent } from '../events/PagoRecibidoMercadoPagoEvent';

export const mockPagoMPEvent = new PagoRecibidoMercadoPagoEvent(RequestContext.empty(), {
  createdAt: new Date('2022-01-12T14:36:57.899Z'),
  updatedAt: new Date('2022-01-12T14:36:57.899Z'),
  method: 'mercado-pago',
  amount: 125000,
  state: 'Settled',
  errorMessage: '',
  transactionId: '427A425SP6NK7AHW-1641998218012',
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  order: {
    createdAt: new Date('2022-01-12T14:31:39.127Z'),
    updatedAt: new Date('2022-01-12T14:36:57.899Z'),
    code: '427A425SP6NK7AHW',
    state: 'PaymentAuthorized',
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    customer: {
      emailAddress: 'test@test.com',
    },
    //... simplificado, tiene más campos
  },
  metadata: {
    metodo: 'MercadoPago',
    link_de_pago:
      'https://www.mercadopago.com.ar/checkout/v1/redirect?pref_id=835446788-22f97709-fc5e-49f3-ad80-49d50d5ec41f',
    preferencia: {
      client_id: '2599399805009905',
      external_reference: '427A425SP6NK7AHW',
      id: '835446788-22f97709-fc5e-49f3-ad80-49d50d5ec41f',
      collector_id: 835446788,
      total_amount: null,
      last_updated: null,
      date_created: '2022-01-12T14:36:58.982+00:00',
      operation_type: 'regular_payment',
      items: [
        {
          id: '',
          category_id: '',
          currency_id: 'ARS',
          description: '',
          title: 'Productos varios con adicionales',
          quantity: 1,
          unit_price: 1250,
        },
      ],
    },
    public: {
      preferenciaId: '835446788-22f97709-fc5e-49f3-ad80-49d50d5ec41f',
      init_point:
        'https://www.mercadopago.com.ar/checkout/v1/redirect?pref_id=835446788-22f97709-fc5e-49f3-ad80-49d50d5ec41f',
      public_key: 'TEST-34b20da1-01ac-4449-9cbc-98eb026a041d',
      pagos: [
        {
          fecha: '2022-01-12T10:37:38.806-04:00',
          metodo: 'visa',
          monto: 1250,
          estado: 'Aprobado',
          estado_detallado: 'Acreditado',
        },
      ],
    },
    pagos: [
      {
        id: 1245357437,
        tipo_pago: 'Tarjeta de crédito',
        metodo_pago: 'visa',
        estado: 'Aprobado',
        estado_detallado: 'Acreditado',
        pagador: {
          first_name: null,
          last_name: null,
          email: 'test_user_80507629@testuser.com',
          identification: {
            number: '32659430',
            type: 'DNI',
          },
          phone: {
            area_code: null,
            number: null,
            extension: null,
          },
          type: null,
          entity_type: null,
          id: '835446823',
        },
        orden: {
          id: '3951234590',
          type: 'mercadopago',
        },
      },
    ],
  },
});
