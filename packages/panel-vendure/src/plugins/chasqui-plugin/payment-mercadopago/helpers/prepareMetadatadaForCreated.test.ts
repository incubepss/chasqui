/* eslint-disable @typescript-eslint/ban-ts-comment */
import preferencia from '../mocks/preferencia.json';
import prepareMetadatadaForCreated, { _extractData } from './prepareMetadatadaForCreated';

describe('Prepara metadata para el proceso de creacion del Payment de vendure', () => {
  test('Extrae datos de preferencia de mercadopago', () => {
    // @ts-ignore
    const result = _extractData(preferencia);

    expect(result).toBeTruthy();
    expect(result).toHaveProperty('id');
    expect(result).toHaveProperty('collector_id');
    expect(result).toHaveProperty('external_reference');
    expect(result).toHaveProperty('total_amount');
    expect(result).toHaveProperty('last_updated');
    expect(result).toHaveProperty('date_created');
    expect(result).toHaveProperty('operation_type');
    expect(result).toHaveProperty('items');
  });

  test('Prepara metadata para adjuntar a la creacion del Payment de Vendure', () => {
    // @ts-ignore
    const result = prepareMetadatadaForCreated(preferencia, { public_key: 'some-value' });

    expect(result).toBeTruthy();
    expect(result).toHaveProperty('metodo', 'MercadoPago');
    expect(result).toHaveProperty('preferencia');
    expect(result).toHaveProperty(['public', 'preferenciaId']);
    expect(result).toHaveProperty(['public', 'init_point']);
    expect(result).toHaveProperty(['public', 'public_key'], 'some-value');
  });
});
