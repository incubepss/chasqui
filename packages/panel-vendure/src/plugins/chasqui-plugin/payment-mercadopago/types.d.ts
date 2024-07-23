/**
 * DOC REF:
 *
 * https://www.mercadopago.com.ar/developers/en/reference/payments/_payments_search/get
 */

import { Payment } from '@vendure/core';
import { CreatePreferencePayload } from 'mercadopago/models/preferences/create-payload.model';

export type PaymentMercadoPago = {
  [key: string]: any;
  id: string;
  payment_type_id: string; // ex: 'ticket' | 'credit_card'
  payment_method_id: string; // ex: 'visa' | 'rapipago'
  status:
    | 'pending'
    | 'approved'
    | 'authorized'
    | 'in_process'
    | 'in_mediation'
    | 'rejected'
    | 'cancelled'
    | 'refunded'
    | 'charged_back';
  status_detail: string; //ex: 'accredited' | 'pending_contingency' | 'pending_waiting_payment' ...;
  payer: {
    id: string;
    email: string;
    identification: string;
  };
  order: {
    id: string;
    type: string;
  };
  date_last_updated: string;
  date_created: string;
  date_approved: string;
  transaction_amount: number;
  currency_id: string;
};

export type ResultMercadoPago = {
  paging: { total: number; limit: number; offset: number };
  results?: Array<PaymentMercadoPago>;
};

export type PreferenciaMercadoPago = CreatePreferencePayload & {
  id: string;
  init_point: string;
  client_id: string;
  collector_id: string;
  total_amount: number;
  last_updated: string;
  date_created: string;
  operation_type: string;
};

export type PagoMetadataPublic = {
  fecha: string;
  metodo: string;
  monto: number;
  estado: string;
  estado_detallado: string;
};

export type PagoMetadata = {
  public: {
    pagos: Array<PagoMetadataPublic>;
  };
  pagos: Array<any>;
};

export type PagoRecibido = Payment & {
  metadata: PagoMetadata;
};
