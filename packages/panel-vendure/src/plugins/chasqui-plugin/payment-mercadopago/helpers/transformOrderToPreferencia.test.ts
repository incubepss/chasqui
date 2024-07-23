/* eslint-disable @typescript-eslint/ban-ts-comment */
import order1 from '../mocks/order_surcharges_shipping.json';
import orderOneProduct from '../mocks/order_only_one_product.json';
import transformOrderToPreferencia from './transformOrderToPreferencia';

describe('Transforma una Order de vendure a una Preferencia de Mercado Pago', () => {
  test('Debe tener un solo item con el total', () => {
    // @ts-ignore
    const preferencia = transformOrderToPreferencia(order1);
    expect(preferencia).toBeTruthy();
    expect(preferencia.items).toHaveLength(1);
    expect(preferencia.items?.[0]).toHaveProperty('title', 'Productos varios con envio y adicionales');
    expect(preferencia.items?.[0]).toHaveProperty('quantity', 1);
    expect(preferencia.items?.[0]).toHaveProperty('unit_price', 1200);
  });

  test('Cuando hay un solo producto, debe aparecer el nombre del producto', () => {
    // @ts-ignore
    const preferencia = transformOrderToPreferencia(orderOneProduct);
    expect(preferencia).toBeTruthy();
    expect(preferencia.items).toHaveLength(1);
    expect(preferencia.items?.[0]).toHaveProperty(
      'title',
      'Harina 000 SICSA x  1 kg con envio y adicionales',
    );
    expect(preferencia.items?.[0]).toHaveProperty('quantity', 1);
    expect(preferencia.items?.[0]).toHaveProperty('unit_price', 580);
  });
});
