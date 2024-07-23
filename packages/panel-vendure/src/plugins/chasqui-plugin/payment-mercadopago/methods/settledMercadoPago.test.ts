/* eslint-disable @typescript-eslint/ban-ts-comment */

import order from '../mocks/order.json';
import payments_search_another_currency from '../mocks/payments_search_another_currency.json';
import payments_search from '../mocks/payments_search.json';
import payments_search_empty from '../mocks/payments_search_empty.json';
import payments_search_partial from '../mocks/payments_search_partial.json';
import settledMercadoPago, { _extractPaymentData } from './settledMercadoPago';

describe('Process Settling for MercadoPago', () => {
  test('Extracción de campos de un pago de mercadopago', () => {
    // @ts-ignore
    const result = _extractPaymentData(payments_search.results[0]);

    expect(result).toHaveProperty('tipo_pago', 'Tarjeta de crédito');
    expect(result).toHaveProperty('estado', 'Aprobado');
    expect(result).toHaveProperty('estado_detallado', 'Acreditado');
  });

  test('Con pago aprobado cubre el total', () => {
    // @ts-ignore
    const result = settledMercadoPago(order, payments_search);

    expect(result).toHaveProperty('success', true);
    expect(result).not.toHaveProperty('errorMessage');
    expect(result).toHaveProperty(['metadata', 'public']);
    expect(result).toHaveProperty(['metadata', 'pagos', 0, 'id']);
    expect(result).toHaveProperty(['metadata', 'pagos', 0, 'fecha_aprobado']);
    expect(result).toHaveProperty(['metadata', 'pagos', 0, 'fecha_ultimo_cambio']);
    expect(result).not.toHaveProperty(['metadata', 'pagos', 0, 'public']);
  });

  test('Con pago aprobado pero sin cubrir el monto total', () => {
    // @ts-ignore
    const result = settledMercadoPago(order, payments_search_partial);

    expect(result).toHaveProperty('success', false);
    expect(result).toHaveProperty('state', 'Authorized');
    expect(result).toHaveProperty('errorMessage');
    expect(result).toHaveProperty(['metadata', 'pagos', 0, 'id']);
    expect(result).toHaveProperty(['metadata', 'pagos', 0, 'fecha_ultimo_cambio']);
  });

  test('Sin pagos', () => {
    // @ts-ignore
    const result = settledMercadoPago(order, payments_search_empty);

    expect(result).toHaveProperty('success', false);
    expect(result).toHaveProperty('state', 'Authorized');
    expect(result).toHaveProperty('errorMessage', 'No hay pagos realizados');
  });

  test('Con pago aprobado pero otra moneda', () => {
    // @ts-ignore
    const result = settledMercadoPago(order, payments_search_another_currency);

    expect(result).toHaveProperty('success', false);
    expect(result).toHaveProperty('state', 'Authorized');
    expect(result).toHaveProperty('errorMessage', 'Pago con otra moneda');
    expect(result).toHaveProperty(['metadata', 'pagos', 0, 'id']);
    expect(result).toHaveProperty(['metadata', 'pagos', 0, 'fecha_ultimo_cambio']);
    expect(result).toHaveProperty(['metadata', 'pagos', 0, 'moneda_id'], 'UYU');
  });
});
