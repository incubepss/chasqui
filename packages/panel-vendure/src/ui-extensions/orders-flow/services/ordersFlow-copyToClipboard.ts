import { Order, OrderGroup, OrderItemGrouped } from '../generated-types';

import ordersFlowUtils from './ordersFlow-utils';

/**
 * @returns {string} en caso de error
 */
export const orderGroupCopyToClipboard = async (orderGroup: OrderGroup): Promise<string | undefined> => {
  if (!navigator.clipboard) {
    return 'El portapapeles no está disponible';
  }

  if (!orderGroup) {
    return 'Pedido no disponible';
  }

  let allRows: string[][] = [];

  // encabezado
  allRows = detailOrderGroupRow(orderGroup);

  // por articulos
  const linesGrouped = orderGroup?.linesGrouped;
  if (linesGrouped) {
    const linesGroupedRows = linesGroupedTo2DPlainArray(linesGrouped);
    linesGroupedRows.unshift(linesGroupedHeader());
    allRows = allRows.concat([[], []]).concat(linesGroupedRows);
    allRows = allRows.concat(orderShipping(orderGroup));
  }

  // por persona / pedido
  const ordersConfirmed = orderGroup?.ordersConfirmed;
  if (ordersConfirmed) {
    ordersConfirmed.items.forEach((order: Order) => {
      const rows = orderOfGroupHeader(order)
        .concat([ordersHeaderColumn()])
        .concat(ordersConfirmedTo2DPlainArray(order))
        .concat(orderShipping(order, 1));
      allRows = allRows.concat([[], []]).concat(rows);
    });
  }
  const rowsTxt = allRows.map(lines => lines.join('\t')).join('\n');
  return copyTextToClipboard(rowsTxt);
};

/**
 * @returns {string} en caso de error
 */
export const orderCopyToClipboard = async (order: Order): Promise<string | undefined> => {
  if (!navigator.clipboard) {
    return 'El portapapeles no está disponible';
  }

  if (!order) {
    return 'Pedido no disponible';
  }

  let allRows: string[][] = [];

  // encabezado
  allRows = orderDetail(order)
    .concat([[], []])
    .concat([ordersHeaderColumn()])
    .concat(ordersConfirmedTo2DPlainArray(order))
    .concat(orderShipping(order, 1));

  const rowsTxt = allRows.map(lines => lines.join('\t')).join('\n');
  return copyTextToClipboard(rowsTxt);
};

export const detailOrderGroupRow = (order: OrderGroup): string[][] => {
  return [
    ['Pedido grupal coordinado por', order.customer.firstName + ' ' + order.customer.lastName],
    ['Código del consumidor', order.customer.customFields?.codeCustomer || ''],
    ['Email', order.customer.emailAddress],
    ['Fecha', order.orderPlacedAt],
    ['Código pedido grupal', order.code],
    ['Tipo Entrega', ordersFlowUtils.getTypeDelivery(order)],
    ['Entrega', ordersFlowUtils.getShippingMethodName(order)],
    ['Dirección', ordersFlowUtils.getAddressDelivery(order)],
    ['Cantidad pedidos', order.ordersQuantity.toString()],
    ['Total', (order.totalWithTax / 100).toString()],
  ];
};

const linesGroupedHeader = (): string[] => {
  return ['Productor', 'Código Producto', 'Nombre Producto', 'Precio Lista', 'Cantidad', 'Monto'];
};

const linesGroupedTo2DPlainArray = (items: Array<OrderItemGrouped>): string[][] => {
  return items.reduce((tmp, item) => {
    tmp.push([
      item.productorNombre,
      item.productoSku,
      item.productoNombre,
      (item.listPrice / 100).toString(),
      item.cantidad.toString(),
      (item.subTotallistPrice / 100).toString(),
    ]);
    return tmp;
  }, [] as string[][]);
};

const orderDetail = (order: Order): string[][] => {
  return [
    ['Pedido por', order.customer.firstName + ' ' + order.customer.lastName],
    ['Código consumidor', order.customer.customFields?.codeCustomer || ''],
    ['Email', order.customer.emailAddress],
    ['Fecha', order.orderPlacedAt],
    ['Código pedido individual', order.code],
    ['Tipo Entrega', ordersFlowUtils.getTypeDelivery(order)],
    ['Entrega', ordersFlowUtils.getShippingMethodName(order)],
    ['Dirección', ordersFlowUtils.getAddressDelivery(order)],
    ['Cantidad artículos', order.totalQuantity.toString()],
    ['Total', (order.totalWithTax / 100).toString()],
  ];
};

const orderShipping = (order: Order | OrderGroup, startColNum = 2): string[][] => {
  const rows: string[][] = [];

  if (order.shippingWithTax <= 0 || !order?.shippingLines?.[0]) {
    return rows;
  }

  const shipping = order.shippingLines[0];

  const name = 'Envio: ' + shipping.shippingMethod?.name;
  const amount = (order.shippingWithTax / 100).toString();

  let row: string[] = [];

  for (let i = 0; i < startColNum; i++) {
    row.push('');
  }

  row = row.concat([name, '', '', amount]);
  rows.push(row);

  return rows;
};

const orderOfGroupHeader = (order: Order): string[][] => {
  const customerName = `${order.customer?.firstName} ${order.customer?.lastName}`;
  return [
    ['Persona', customerName],
    ['Email', order.customer?.emailAddress],
    ['Telefono', order.customer?.phoneNumber],
    ['Total', (order.totalWithTax / 100).toString()],
  ];
};

const ordersHeaderColumn = (): string[] => {
  return ['Código Producto', 'Nombre Producto', 'Precio Lista', 'Cantidad', 'Monto'];
};

const ordersConfirmedTo2DPlainArray = (order: Order): string[][] => {
  const lines = order.lines.reduce((tmp, item) => {
    tmp.push([
      item.productVariant.sku,
      item.productVariant.name,
      (item.unitPriceWithTax / 100).toString(),
      item.quantity.toString(),
      (item.linePriceWithTax / 100).toString(),
    ]);
    return tmp;
  }, [] as string[][]);

  const discounts =
    order.discounts
      ?.filter(d => d.type !== 'OTHER')
      .reduce((tmp, item) => {
        tmp.push(['', 'Descuento ' + item.description, '', '', (item.amountWithTax / 100).toString()]);
        return tmp;
      }, [] as string[][]) || [];

  const surcharges =
    order.surcharges?.reduce((tmp, item) => {
      tmp.push(['', item.description, '', '', (item.priceWithTax / 100).toString()]);
      return tmp;
    }, [] as string[][]) || [];

  return lines.concat(discounts).concat(surcharges);
};

export const copyTextToClipboard = async (text): Promise<string | undefined> => {
  if (!navigator.clipboard) {
    return 'El portapapeles no está disponible';
  }
  return await navigator.clipboard.writeText(text).then(
    () => {
      return '';
    },
    () => {
      return 'No se pudo copiar los registros';
    },
  );
};

export default {
  detailOrderGroupRow,
  orderGroupCopyToClipboard,
  orderCopyToClipboard,
  copyTextToClipboard,
};
