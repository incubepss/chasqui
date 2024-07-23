import { Order, OrderLine } from '@vendure/core';
import { CreatePreferencePayload, PreferenceItem } from 'mercadopago/models/preferences/create-payload.model';
import { Currency } from 'mercadopago/shared/currency';

/**
 *  Transforms a Vendure Order to a MercadoPago "Preferencia"
 *
 */

const _orderLineToItem = (currencyCode: Currency, line: OrderLine): PreferenceItem => {
  return {
    title: line.productVariant.translations[0].name,
    quantity: line.quantity,
    unit_price: line.unitPriceWithTax / 100,
    currency_id: currencyCode,
  };
};

export const transformOrderToPreferencia = (order: Order): CreatePreferencePayload => {
  if (!order) {
    throw new Error('Orden inexistente');
  }

  let title = 'Productos varios';
  const parts = [];

  if (order.lines?.length === 1) {
    title = order.lines[0].productVariant.name;
  }

  if (order.shippingWithTax > 0) {
    parts.push('envio');
  }

  if (order.surcharges.length > 0) {
    parts.push('adicionales');
  }

  if (parts.length > 0) {
    title += ' con ' + parts.join(' y ');
  }

  const uniqueItem = {
    title: title,
    quantity: 1,
    unit_price: order.totalWithTax / 100,
    currency_id: order.currencyCode,
  };

  const preference: CreatePreferencePayload = {
    external_reference: order.code,
    items: [uniqueItem],
  };

  return preference;
};

export default transformOrderToPreferencia;
