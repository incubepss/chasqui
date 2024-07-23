import { Injectable, OnModuleInit } from '@nestjs/common';
import Odoo from 'odoo-await';
import { JobQueue, JobQueueService, RequestContext, ID, Job, Logger, ChannelService } from '@vendure/core';
import { OdooProduct } from './odoo.service.d';
import { OdooService } from './odoo.service';
import { ProductoImporter } from './helpers/producto-importer';

export type JobParams = {
  productDetail: OdooProduct;
  idChannel: ID;
};

export interface OdooProductImport {
  id: number;
  name: string;
  list_price: number;
  qty_available: number;
  barcode: string;
  product_tooltip: string;
  image_1920: string | false;
  taxes_id: [number];
  pos_categ_id: [number, string];
}

@Injectable()
export class ImporterOdooService implements OnModuleInit {
  private jobProductQueue: JobQueue<JobParams>;

  constructor(
    private jobQueueService: JobQueueService,
    private odooService: OdooService,
    private productoImporter: ProductoImporter,
    private channelService: ChannelService,
  ) {}

  async onModuleInit() {
    this.jobProductQueue = await this.jobQueueService.createQueue({
      name: 'importer-odoo-product',
      process: async job => this._doProductJob(job),
    });
  }

  async importProductsOdooToChannel(ctx: RequestContext, odooProducts: OdooProduct[]) {
    const idChannel = ctx.channel.id;
    const channel = await this.channelService.getChannelFromToken(ctx, ctx.channel.token);
    const odoo = new Odoo({
      baseUrl: (channel.customFields as any).odooHost,
      db: (channel.customFields as any).odooDB,
      username: (channel.customFields as any).odooUser,
      password: (channel.customFields as any).odooPass,
    });
    await odoo.connect();
    return this.fetchProducts(ctx, odooProducts, idChannel, odoo);
  }

  async fetchProducts(
    ctx: RequestContext,
    odooProducts: OdooProduct[],
    idChannel: ID,
    odoo: Odoo,
  ): Promise<void> {
    for (const product of odooProducts) {
      try {
        const result = await this.getOdooProduct(ctx, product.barcode, odoo);
        const productDetail = result[0];
        this.jobProductQueue.add({
          productDetail,
          idChannel,
        });
      } catch (error) {
        console.error('Error al consultar el producto:', error);
      }
    }
  }

  private _doProductJob(job: Job<JobParams>): any {
    Logger.info(
      `Corriendo Job importación ${job.id} Canal:${job.data.idChannel}  Producto: ${job.data.productDetail.id}`,
    );
    return this.productoImporter.importProduct(job.data.productDetail, job.data.idChannel);
  }

  async getOdooProduct(ctx: RequestContext, barcode: string, odoo: Odoo): Promise<OdooProduct[] | any> {
    try {
      const product: OdooProductImport[] = await odoo.searchRead(
        `product.template`,
        [['barcode', '=', barcode]],
        [
          'id',
          'name',
          'list_price',
          'qty_available',
          'barcode',
          'product_tooltip',
          'image_1920',
          'taxes_id',
          'pos_categ_id',
        ],
        {
          limit: 1,
          offset: 0,
        },
      );
      return product.map((p: OdooProductImport) => ({
        id: p.id,
        name: p.name,
        list_price: p.list_price,
        qty_available: p.qty_available,
        barcode: p.barcode,
        image_128: p.image_1920 === false ? 'false' : p.image_1920,
        product_tooltip: p.product_tooltip,
        taxes_id: p.taxes_id,
        pos_categ: p.pos_categ_id[1],
      }));
    } catch (error) {
      console.error('Error fetching Odoo product:', error);
      throw error;
    }
  }
}
