import { Injectable } from '@nestjs/common';
import { Order, Payment } from '@vendure/core';
import Odoo from 'odoo-await';

export type OdooParams = {
  customerId: number;
  odooCompanyId: number;
};

@Injectable()
export class OrderExport {
  async createOdooOrder(odoo: Odoo, odooParams: OdooParams, order: Order, orderPayments: Payment[]) {
    const invoiceLineIdPromises = order.lines.map(itemLine =>
      odoo.search('product.product', ['barcode', '=', itemLine.productVariant.sku]).then(productId => [
        0,
        0,
        {
          name: itemLine.productVariant.name,
          product_id: productId[0],
          product_uom_qty: itemLine.quantity,
          //quantity: itemLine.quantity,//este valor es para la factura
          price_unit: itemLine.productVariant.price / 100,
        },
      ]),
    );

    const invoiceLineId = await Promise.all(invoiceLineIdPromises);
    const date_now = new Date().toISOString().slice(0, 10);

    const invoice = {
      name: 'CHQ-' + order.code,
      partner_id: odooParams.customerId,
      validity_date: date_now,
      company_id: odooParams.odooCompanyId,
      order_line: invoiceLineId,
      origin: order.code,
    };
    const orderId = await odoo.create('sale.order', invoice);

    const message = {
      body: orderPayments[0].metadata.comments,
      message_type: 'comment',
      res_id: orderId,
      model: 'sale.order',
    };
    await odoo.create('mail.message', message);

    // este es el modelo para escribir una factura (account.move)
    // const invoice = {
    //   name: 'FA-' + order.code,
    //   partner_id: odooParams.customerId,
    //   move_type: 'out_invoice',
    //   invoice_date: date_now,
    //   date: date_now,
    //   invoice_origin: 'Chasqui',
    //   company_id: odooParams.odooCompanyId,
    //   invoice_line_ids: invoiceLineId,
    //   ref: order.code,
    // };
    // const orderId = await odoo.create('account.move', invoice);

    return orderId;
  }

  async findOdooOrders(odoo: Odoo, id: string) {
    await odoo.connect();
    const orders = await odoo.search(`sale.order`, { display_name: id });
    return orders;
  }
}
