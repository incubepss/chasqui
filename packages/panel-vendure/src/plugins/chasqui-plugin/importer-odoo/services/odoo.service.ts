import { Injectable } from '@nestjs/common';
import Odoo from 'odoo-await';
import {
  RequestContext,
  ChannelService,
  OrderService,
  CustomerService,
  Customer,
  Address,
  Channel,
} from '@vendure/core';
import { OdooProduct } from './odoo.service.d';
import { OrderExport } from './helpers/order-export';
import { ODOO_PARAMS } from './paramsContext';

let odooInstance: Odoo | undefined;

@Injectable()
export class OdooService {
  private channel: Channel;
  constructor(
    private channelService: ChannelService,
    private orderService: OrderService,
    private customerService: CustomerService,
    private orderExport: OrderExport,
  ) {}
  async onModuleInit() {
    console.log('iniciando modulo OdooService');
  }

  private getOdooInstance() {
    if (!odooInstance) {
      odooInstance = new Odoo({
        baseUrl: (this.channel.customFields as any).odooHost,
        db: (this.channel.customFields as any).odooDB,
        username: (this.channel.customFields as any).odooUser,
        password: (this.channel.customFields as any).odooPass,
      });
    }
    return odooInstance;
  }

  async getOdooProducts(ctx: RequestContext): Promise<OdooProduct[]> {
    this.channel = await this.channelService.getChannelFromToken(ctx, ctx.channel.token);
    const odoo = this.getOdooInstance();
    await odoo.connect();

    const products: any = await odoo.searchRead(
      `product.template`,
      [
        ['type', '=', 'product'],
        ['company_id', '=', (this.channel.customFields as any).odooCompanyId],
        ['barcode', '!=', false],
        ['pos_categ_id', '!=', false],
      ],
      [
        'id',
        'name',
        'list_price',
        'qty_available',
        'barcode',
        'product_tooltip',
        'image_128',
        'taxes_id',
        'tax_string',
        'pos_categ_id',
      ],
      {
        limit: 200,
        offset: 0,
      },
    );
    return products.map((p: any) => ({
      id: p.id,
      name: p.name,
      list_price: p.list_price,
      qty_available: p.qty_available,
      barcode: p.barcode,
      image_128: p.image_128 === false ? 'false' : p.image_128,
      product_tooltip: p.product_tooltip,
      taxes_id: p.taxes_id,
      tax_string: p.tax_string,
      pos_categ: p.pos_categ_id[1],
    }));
  }

  async findOdooCustomer(ctx: RequestContext, odoo: Odoo, customer: Customer) {
    const odooCustomer = await odoo.search(`res.partner`, [
      ['is_company', '=', false],
      ['email', '=', customer.emailAddress],
    ]);

    if (odooCustomer.length === 0) {
      let partner: any = {
        name: `${customer.firstName} ${customer.lastName}`,
        display_name: `${customer.firstName} ${customer.lastName}`,
        active: true,
        is_company: false,
        is_public: false,
        email: customer.emailAddress,
        company_type: 'person',
        l10n_ar_afip_responsibility_type_id:
          JSON.parse((this.channel.customFields as any).odooParams).afipResId |
          JSON.parse(ODOO_PARAMS).afipResId,
        comment: `Importado de chasqui (chasqui_id: ${customer.id})`,
      };
      const customerAddress: Address = await this.customerService
        .findAddressesByCustomerId(ctx, customer.id)
        .then(addresses => addresses[0]);
      if (customerAddress) {
        partner = {
          ...partner,
          street: customerAddress.streetLine1,
          street2: customerAddress.streetLine2,
          zip: customerAddress.postalCode,
          city: customerAddress.city + ', ' + customerAddress.province,
          phone: customerAddress.phoneNumber,
        };
      }
      const partnerId = await odoo.create('res.partner', partner);
      return partnerId;
    }
    return odooCustomer[0];
  }

  async exportOrderToOdoo(ctx: RequestContext, orderId: string) {
    this.channel = await this.channelService.getChannelFromToken(ctx, ctx.channel.token);
    const odoo = this.getOdooInstance();
    await odoo.connect();

    //recupero la orden completa por el id
    const order = await this.orderService.findOne(ctx, orderId);
    const orderPayments = await this.orderService.getOrderPayments(ctx, orderId);

    if (order?.customer) {
      // traigo el id del consumidor de odoo o lo creo si no existe
      const customerId = await await this.findOdooCustomer(ctx, odoo, order.customer);
      const odooParams = {
        customerId: customerId,
        odooCompanyId: (this.channel.customFields as any).odooCompanyId,
      };

      // aca escribo la factura de odoo y recuperar el id
      const odooId = await this.orderExport.createOdooOrder(odoo, odooParams, order, orderPayments);

      // ahora tomo el id de odoo y escribo una nota en la orden de chasqui
      this.orderService.addNoteToOrder(ctx, { id: orderId, isPublic: false, note: `{"odooId":${odooId}}` });
      return odooId;
    }
    return 'No se pudo exportar el pedido';
  }
}
