import { PreferenciaMercadoPago } from '../types.d';

export const _extractData = (preferencia: PreferenciaMercadoPago): any => {
  return {
    client_id: preferencia.client_id,
    external_reference: preferencia.external_reference,
    id: preferencia.id,
    collector_id: preferencia.collector_id,
    total_amount: preferencia.total_amount,
    last_updated: preferencia.last_updated,
    date_created: preferencia.date_created,
    operation_type: preferencia.operation_type,
    items: preferencia.items,
  };
};

export const prepareMetadatadaForCreated = (preferencia: PreferenciaMercadoPago, args: any): any => {
  return {
    metodo: 'MercadoPago',
    link_de_pago: preferencia.init_point,
    preferencia: _extractData(preferencia),
    // Any metadata in the `public` field
    // will be available in the Shop API,
    // All other metadata is private and
    // only available in the Admin API.
    public: {
      preferenciaId: preferencia.id,
      init_point: preferencia.init_point,
      public_key: args.public_key,
    },
  };
};

export default prepareMetadatadaForCreated;
