/**
 * DOC REF:
 *
 * see the "Response parameters" section on
 *
 * https://www.mercadopago.com.ar/developers/en/reference/payments/_payments_search/get
 *
 */

export const _genericTranslator = (map: { [key: string]: string }, value: string) => {
  if (!value) {
    return '';
  }

  return value in map ? map[value] : value;
};

const map: { [key: string]: string } = {
  // payment_type_id
  credit_card: 'Tarjeta de crédito',
  debit_card: 'Tarjet de debito',
  ticket: 'Red cobro',
  bank_transfer: 'Transferencia bancaria',

  // status
  approved: 'Aprobado',
  pending: 'Pendiente',
  rejected: 'Rechazado',
  cancelled: 'Cancelado',
  in_process: 'Proceso de revisión',

  // status_detail
  accredited: 'Acreditado',
  pending_waiting_payment: 'En espera del pago',
  pending_contingency: 'En espera por contingencia',
};

export const translatorTermMP = (value: string): string => {
  return _genericTranslator(map, value);
};

export default translatorTermMP;
